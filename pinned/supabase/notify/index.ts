// @ts-nocheck
// Pinned: "notify" edge function
// Sends "New note from <name>" to the other person's phone(s) using Web Push.
// No npm packages: encryption (RFC 8291) and VAPID (RFC 8292) use built-in WebCrypto.
//
// Secrets needed (Supabase > Edge Functions > Secrets):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (e.g. mailto:you@example.com)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.

const enc = new TextEncoder();

export function b64uToBytes(s: string): Uint8Array {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function bytesToB64u(b: Uint8Array): string {
  let s = "";
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, len: number) {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, key, len * 8);
  return new Uint8Array(bits);
}

// RFC 8291 aes128gcm payload encryption
export async function encryptPayload(p256dh: string, authSecretB64u: string, plaintext: Uint8Array) {
  const uaPublic = b64uToBytes(p256dh);
  const authSecret = b64uToBytes(authSecretB64u);
  const as = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey("raw", as.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", uaPublic, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, as.privateKey, 256));
  const ikm = await hkdf(authSecret, shared, concat(enc.encode("WebPush: info\0"), uaPublic, asPublic), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, enc.encode("Content-Encoding: nonce\0"), 12);
  const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, concat(plaintext, new Uint8Array([2]))));
  const rs = new Uint8Array([0, 0, 16, 0]); // record size 4096
  return concat(salt, rs, new Uint8Array([asPublic.length]), asPublic, ct);
}

// RFC 8292 VAPID JWT (ES256)
export async function vapidAuth(endpoint: string, publicKey: string, privateKey: string, subject: string) {
  const pub = b64uToBytes(publicKey);
  const jwk = {
    kty: "EC", crv: "P-256", ext: true,
    x: bytesToB64u(pub.slice(1, 33)), y: bytesToB64u(pub.slice(33, 65)), d: privateKey,
  };
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const header = bytesToB64u(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const claims = bytesToB64u(enc.encode(JSON.stringify({
    aud: new URL(endpoint).origin,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: subject,
  })));
  const unsigned = `${header}.${claims}`;
  const sig = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(unsigned)));
  return `vapid t=${unsigned}.${bytesToB64u(sig)}, k=${publicKey}`;
}

export async function sendPush(
  sub: { endpoint: string; p256dh: string; auth: string },
  payload: unknown,
  vapid: { publicKey: string; privateKey: string; subject: string },
) {
  const body = await encryptPayload(sub.p256dh, sub.auth, enc.encode(JSON.stringify(payload)));
  return fetch(sub.endpoint, {
    method: "POST",
    headers: {
      Authorization: await vapidAuth(sub.endpoint, vapid.publicKey, vapid.privateKey, vapid.subject),
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      TTL: "86400",
      Urgency: "high",
    },
    body,
  });
}

// ---------------- HTTP handler ----------------

// CORS: echo back whatever headers the browser asks to send, so newer supabase-js versions aren't blocked
let cors: Record<string, string> = {};
const setCors = (req: Request) => {
  cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": req.headers.get("Access-Control-Request-Headers") ??
      "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...cors, "Content-Type": "application/json" } });

if (typeof Deno !== "undefined" && Deno.serve) {
  const URL_ = Deno.env.get("SUPABASE_URL")!;
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const vapid = {
    publicKey: Deno.env.get("VAPID_PUBLIC_KEY") ?? "",
    privateKey: Deno.env.get("VAPID_PRIVATE_KEY") ?? "",
    // Apple's push service rejects the request (403 BadJwtToken) unless this is a real mailto: or https: contact.
    // Placeholders like you@example.com work on Android but fail on iPhone, so those fall back to the app's address.
    subject: (() => {
      const fallback = "https://9bitbin.github.io/stuck-on-you/";
      let v = (Deno.env.get("VAPID_SUBJECT") ?? "").replace(/\s+/g, "").replace(/^["']|["']$/g, "");
      if (v && !/^(mailto:|https:\/\/)/i.test(v) && v.includes("@")) v = "mailto:" + v;
      const okMail = /^mailto:[^@]+@[^@]+\.[a-z]{2,}$/i.test(v);
      const okUrl = /^https:\/\/[^/]+\.[a-z]{2,}/i.test(v);
      if (!(okMail || okUrl) || /example\.(com|org|net)|localhost|\.local\b|yourname|you@/i.test(v)) return fallback;
      return v;
    })(),
  };
  const admin = (path: string, init: RequestInit = {}) =>
    fetch(`${URL_}${path}`, {
      ...init,
      headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
    });

  const PINGS: Record<string, string> = {
    think: "is thinking of you 💭", miss: "misses you 🥺", love: "loves you ❤️",
    morning: "says good morning ☀️", night: "says good night 🌙", hug: "sent you a hug 🤗",
    mood_happy: "is feeling happy 😊", mood_chill: "is feeling chill 😌", mood_tired: "is feeling tired 😴",
    mood_stressed: "is feeling stressed 😣", mood_excited: "is feeling excited 🤩", mood_sad: "is feeling down 😢",
  };
  const MUTABLE = ["reaction", "reply", "ping", "answer", "doodle", "message", "bgrequest", "bgreply", "game", "lead", "ttt"];
  const GAMES: Record<string, string> = { kestrel: "Neon Kestrel", pindrop: "Pin Drop", plane: "Paper Plane", hop: "Hop Lane" };
  const q = (v: string) => encodeURIComponent(v);
  const getJson = async (path: string) => { const r = await admin(path); return r.ok ? await r.json() : []; };

  // Send one notification to a set of people, honoring what they muted
  async function sendTo(userIds: string[], payload: Record<string, unknown>, type: string, ignoreMutes = false) {
    let targets = userIds;
    if (!ignoreMutes && MUTABLE.includes(type) && targets.length) {
      const profs: { id: string; muted: string[] | null }[] =
        await getJson(`/rest/v1/profiles?id=in.(${targets.join(",")})&select=id,muted`);
      const muted = new Set(profs.filter((p) => (p.muted || []).includes(type)).map((p) => p.id));
      targets = targets.filter((id) => !muted.has(id));
    }
    if (!targets.length) return { sent: 0, devices: 0, failures: [] as string[], muted: true };
    const subs: { endpoint: string; p256dh: string; auth: string }[] =
      await getJson(`/rest/v1/push_subs?user_id=in.(${targets.join(",")})&select=endpoint,p256dh,auth`);
    let sent = 0;
    const failures: string[] = [];
    await Promise.all(subs.map(async (s) => {
      try {
        const r = await sendPush(s, payload, vapid);
        if (r.status === 404 || r.status === 410) {
          await admin(`/rest/v1/push_subs?endpoint=eq.${q(s.endpoint)}`, { method: "DELETE" });
          failures.push(`${r.status} expired subscription (removed)`);
        } else if (r.ok) sent++;
        else { const t = await r.text(); console.log("push failed", r.status, t); failures.push(`${r.status} ${t.slice(0, 120)}`); }
      } catch (e) { console.log("push error", e); failures.push(String(e)); }
    }));
    return { sent, devices: subs.length, failures };
  }

  const nameOf = async (id: string) => {
    const [p] = await getJson(`/rest/v1/profiles?id=eq.${q(id)}&select=name`);
    return p?.name ?? "your person";
  };

  // Called every minute by the database timer: push scheduled notes whose time has come
  async function runScheduled(secret: string) {
    const [cfg] = await getJson(`/rest/v1/app_secrets?name=eq.cron&select=value`);
    if (!cfg || cfg.value !== secret) return json({ error: "forbidden" }, 403);
    const now = new Date().toISOString();
    const r = await admin(`/rest/v1/notes?show_at=lte.${q(now)}&notified_at=is.null&select=id,board_id,author_id`, {
      method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ notified_at: now }),
    });
    const due: { id: string; board_id: string; author_id: string }[] = r.ok ? await r.json() : [];
    let sent = 0;
    for (const n of due) {
      const members: { user_id: string }[] = await getJson(`/rest/v1/board_members?board_id=eq.${q(n.board_id)}&select=user_id`);
      const others = members.map((m) => m.user_id).filter((id) => id !== n.author_id);
      const name = await nameOf(n.author_id);
      const res = await sendTo(others, { title: "Pinned", body: `New note from ${name}`, url: "./", tag: "soy-note" }, "note");
      sent += res.sent;
    }
    return json({ due: due.length, sent });
  }

  // ---- link previews for playlist cards (done here because browsers can't read other sites) ----
  const OEMBED: [RegExp, (u: string) => string][] = [
    [/(^|\.)(youtube\.com|youtu\.be)$/i, (u) => `https://www.youtube.com/oembed?format=json&url=${q(u)}`],
    [/(^|\.)spotify\.com$/i, (u) => `https://open.spotify.com/oembed?url=${q(u)}`],
    [/(^|\.)soundcloud\.com$/i, (u) => `https://soundcloud.com/oembed?format=json&url=${q(u)}`],
  ];
  const meta = (html: string, prop: string) => {
    const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']`, "i"))
      || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["']`, "i"));
    return m ? m[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'") : null;
  };
  async function unfurl(raw: string) {
    let url: URL;
    try { url = new URL(raw); } catch { return { error: "That doesn't look like a link" }; }
    if (!/^https?:$/.test(url.protocol)) return { error: "Only web links work" };
    const host = url.hostname;
    // never let this be used to reach private or internal addresses
    if (/^(localhost|0\.|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1|\[?f[cd])/i.test(host) || !host.includes(".")) return { error: "That link can't be previewed" };
    const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 6000);
    try {
      const o = OEMBED.find(([re]) => re.test(host));
      if (o) {
        const r = await fetch(o[1](url.href), { signal: ctrl.signal });
        if (r.ok) { const j = await r.json(); return { title: j.title || null, thumb: j.thumbnail_url || null, author: j.author_name || null }; }
      }
      // anything else (Apple Music, articles...): read the page's preview tags
      const r = await fetch(url.href, { signal: ctrl.signal, headers: { "User-Agent": "Mozilla/5.0 (compatible; PinnedBot/1.0)", Accept: "text/html" } });
      const html = (await r.text()).slice(0, 300000);
      const t = meta(html, "og:title") || (html.match(/<title[^>]*>([^<]{1,200})<\/title>/i) || [])[1] || null;
      return { title: t ? t.trim() : null, thumb: meta(html, "og:image"), author: meta(html, "og:site_name") };
    } catch { return { title: null, thumb: null }; }
    finally { clearTimeout(timer); }
  }

  Deno.serve(async (req) => {
    setCors(req);
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (req.method === "GET") return json({ ok: true, function: "notify", version: 5, vapidSet: !!(vapid.publicKey && vapid.privateKey) });
    try {
      if (!vapid.publicKey || !vapid.privateKey) return json({ error: "VAPID secrets missing" }, 500);
      const body = await req.json().catch(() => ({}));
      if (body.cron) return await runScheduled(String(body.cron));

      // Who is calling?
      const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
      const ures = await fetch(`${URL_}/auth/v1/user`, { headers: { apikey: SERVICE, Authorization: `Bearer ${token}` } });
      if (!ures.ok) return json({ error: "unauthorized" }, 401);
      const user = await ures.json();

      if (body.unfurl) return json(await unfurl(String(body.unfurl)));

      const { board_id, test } = body;
      if (!board_id) return json({ error: "board_id required" }, 400);
      const members: { user_id: string }[] = await getJson(`/rest/v1/board_members?board_id=eq.${q(board_id)}&select=user_id`);
      if (!members.some((m) => m.user_id === user.id)) return json({ error: "not a member" }, 403);

      // test mode sends to the caller's own phone(s), so one person can check the whole chain
      if (test) {
        const r = await sendTo([user.id], { title: "Pinned", body: "Test notification: it works ✅", url: "./", tag: "soy-test" }, "test", true);
        return json({ ...r, subject: vapid.subject });
      }

      let others = members.filter((m) => m.user_id !== user.id).map((m) => m.user_id);
      if (!others.length) return json({ sent: 0, devices: 0, note: "nobody else on the board yet" });

      // older app versions send the note kind ("text", "image"...) instead of a type
      const type = ["reaction", "reply", "ping", "answer", "doodle", "message", "bgrequest", "bgreply", "game", "lead", "ttt"].includes(body.type) ? body.type : "note";
      const name = await nameOf(user.id);
      let text = `New note from ${name}`;

      if (type === "note" && body.note_id) {
        // a scheduled note is pushed by the timer at its time, not now
        const [n] = await getJson(`/rest/v1/notes?id=eq.${q(body.note_id)}&select=show_at`);
        if (n?.show_at && new Date(n.show_at).getTime() > Date.now() + 30_000) return json({ sent: 0, scheduled: true });
      }
      if (type === "reaction") {
        const emoji = String(body.emoji ?? "❤️").slice(0, 8);
        text = `${name} reacted ${emoji} to your note`;
      } else if (type === "reply") text = `${name} replied to a note 💬`;
      else if (type === "answer") text = `${name} answered today's question 💬`;
      else if (type === "doodle") text = `${name} wants to doodle together ✏️`;
      else if (type === "message") {
        // a 1-on-1 message only goes to that person; group messages go to everyone else
        if (body.to) { if (!others.includes(String(body.to))) return json({ error: "not on this board" }, 400); others = [String(body.to)]; text = `Message from ${name}`; }
        else text = `${name} in the group chat`;
      } else if (type === "bgrequest") {
        const [b] = await getJson(`/rest/v1/boards?id=eq.${q(board_id)}&select=created_by`);
        if (!b?.created_by || b.created_by === user.id) return json({ sent: 0 });
        others = [b.created_by];
        text = `${name} wants to change the board background 🖼️`;
      } else if (type === "bgreply") {
        const [b] = await getJson(`/rest/v1/boards?id=eq.${q(board_id)}&select=created_by`);
        if (b?.created_by !== user.id || !others.includes(String(body.to))) return json({ error: "not allowed" }, 403);
        others = [String(body.to)];
        text = body.approved ? `${name} approved your background 🎉` : `${name} passed on your background idea`;
      }
      else if (type === "game") {
        const g = GAMES[String(body.game)];
        if (!g) return json({ error: "unknown game" }, 400);
        text = `${name} started a ${g} race 🏁 Open Pinned to join`;
      } else if (type === "lead") {
        // "beat your score": only if the caller really has that score on this board
        const g = GAMES[String(body.game)], score = Math.floor(Number(body.score));
        if (!g || !others.includes(String(body.to)) || !(score >= 0)) return json({ error: "not allowed" }, 400);
        const [row] = await getJson(`/rest/v1/game_scores?board_id=eq.${q(board_id)}&user_id=eq.${q(user.id)}&game=eq.${q(String(body.game))}&score=gte.${score}&select=id&limit=1`);
        if (!row) return json({ error: "score not found" }, 400);
        others = [String(body.to)];
        text = `${name} beat your ${g} best with ${score} 🏆 Your move!`;
      } else if (type === "ttt") {
        const [g] = await getJson(`/rest/v1/ttt_games?id=eq.${q(String(body.game_id))}&board_id=eq.${q(board_id)}&select=x_id,o_id,status,turn,winner`);
        if (!g || (g.x_id !== user.id && g.o_id !== user.id)) return json({ error: "not your game" }, 403);
        const mine = g.x_id === user.id ? "X" : "O";
        others = [mine === "X" ? g.o_id : g.x_id];
        if (g.status === "invited") text = `${name} challenged you to tic-tac-toe ❌⭕`;
        else if (g.status === "active") { if (g.turn === mine) return json({ sent: 0 }); text = `Your move vs ${name} ❌⭕`; }
        else if (g.status === "declined") text = `${name} passed on tic-tac-toe`;
        else if (g.status === "done") text = g.winner === "draw" ? `Tic-tac-toe with ${name}: it's a draw 🤝` : g.winner === mine ? `${name} won at tic-tac-toe ❌⭕ Rematch?` : `You won at tic-tac-toe vs ${name} 🎉`;
        else return json({ sent: 0 });
      }
      else if (type === "ping") {
        const p = PINGS[String(body.ping)];
        if (!p) return json({ error: "unknown check-in" }, 400);
        text = `${name} ${p}`;
      }
      return json(await sendTo(others, { title: "Pinned", body: text, url: "./", tag: `soy-${type}` }, type));
    } catch (e) {
      console.log(e);
      return json({ error: String(e) }, 500);
    }
  });
}
