import { haversine, bearing, compassOf, fmtDist, fmtAcc, buildMapModel } from "./map.js";
// Pinned: shared sticky-note board for two
import { CONFIG } from "./config.js";
import { openChurch } from "./church.js";

// ---------------------------------------------------------------- constants
const BOARD_W = 420;                 // virtual board width (same on every phone)
const MIN_BOARD_H = 1500;
const COLORS = ["c1", "c2", "c3", "c4", "c5", "c6"];
const BRIGHT = { c1: "#ffe066", c2: "#ff8fb1", c3: "#7cc4ff", c4: "#7be495", c5: "#b79cff", c6: "#ffb370" };
const THEMES = [
  { id: "cork", name: "Cozy corkboard", bg: "linear-gradient(135deg,#c39463,#a87a4b)", notes: ["#fff176", "#ffb3c7", "#a7d8ff"] },
  { id: "pastel", name: "Pastel", bg: "linear-gradient(135deg,#ffd9ec,#d8f1ff 60%,#e3ffe9)", notes: ["#fff4b8", "#ffd6e5", "#e9dcff"] },
  { id: "midnight", name: "Dark & minimal", bg: "#0e1014", notes: ["#2b2a1f", "#1d2633", "#2e1f27"] },
  { id: "dreamy", name: "Liminal & dreamy", bg: "linear-gradient(180deg,#f2c9b5,#8d9cc4 55%,#4d5b84)", notes: ["rgba(255,255,255,.55)", "rgba(255,210,226,.6)", "rgba(200,230,255,.6)"] },
];
const EMOJIS = "❤️ 💕 💖 💘 💌 😘 🥰 😍 😊 😂 🥺 😴 🤗 😜 😎 🙈 🫶 🌹 🌸 🌻 💐 🌙 ⭐ ✨ 🔥 🌈 ☕ 🍕 🍜 🍓 🍰 🍿 🎵 🎧 🎉 🎁 🧸 🐱 🐶 🐻 🦋 🍀 👀 👋 🙏 💪 🤞 👏 💯 ✅ 🏠 🚗 ✈️ 💤 ☔ 🌊 🎮 📚 💡 🥂 🌮 🍩 😤 😭".split(" ");
const PENS = ["#222222", "#e5484d", "#f5a524", "#30a46c", "#3e63dd", "#8e4ec6", "#e93d82", "#ffffff"];
const SIZES = [3, 7, 14];
const REACTIONS = ["❤️", "😂", "🥺", "😍", "🔥", "👍"];
const FEELINGS = [["think", "💭", "Thinking of you"], ["miss", "🥺", "Miss you"], ["love", "❤️", "Love you"],
  ["hug", "🤗", "Hug"], ["morning", "☀️", "Good morning"], ["night", "🌙", "Good night"]];
const MOODS = [["mood_happy", "😊", "Happy"], ["mood_chill", "😌", "Chill"], ["mood_excited", "🤩", "Excited"],
  ["mood_tired", "😴", "Tired"], ["mood_stressed", "😣", "Stressed"], ["mood_sad", "😢", "Down"]];
const PING_TEXT = {
  think: "is thinking of you 💭", miss: "misses you 🥺", love: "loves you ❤️", hug: "sent you a hug 🤗",
  morning: "says good morning ☀️", night: "says good night 🌙",
  mood_happy: "is feeling happy 😊", mood_chill: "is feeling chill 😌", mood_excited: "is feeling excited 🤩",
  mood_tired: "is feeling tired 😴", mood_stressed: "is feeling stressed 😣", mood_sad: "is feeling down 😢",
};
const PING_EMOJI = Object.fromEntries([...FEELINGS, ...MOODS].map(([k, e]) => [k, e]));
const MUTE_TYPES = [["message", "Messages"], ["reaction", "Reactions"], ["reply", "Replies"], ["ping", "Check-ins"],
  ["answer", "Daily question answers"], ["doodle", "Draw-together invites"], ["bgrequest", "Background requests (owner)"], ["bgreply", "Background replies"]];
const QUESTIONS = [
  "What's a small thing I do that makes your day better?", "If we could teleport anywhere for one day, where would we go?",
  "What song reminds you of us?", "What's your favorite memory of us so far?", "What's something you've never told me but want to?",
  "What would our perfect lazy Sunday look like?", "What's one thing you want us to try together this year?",
  "What did you think of me when we first met?", "What's your comfort food after a long day?",
  "If our relationship had a theme song, what would it be?", "What's a dream you haven't told many people about?",
  "What makes you feel most loved?", "What's the best date we've been on?", "What made you laugh today?",
  "Where do you see us in five years?", "What's a habit of mine you secretly find cute?", "What's one thing you're proud of this week?",
  "If we started a business together, what would it be?", "What's your favorite way to spend time with me?",
  "What's a place from your childhood you'd love to show me?", "What movie should we watch together next?",
  "What's something you're looking forward to?", "What's a little thing that always cheers you up?",
  "If you could relive one day with me, which would it be?", "What's one thing I could do to support you more?",
  "What's your favorite thing about yourself?", "What smell instantly takes you back somewhere?",
  "What would you name our future pet?", "What's a goal you want us to reach together?",
  "What's the most spontaneous thing you'd want to do with me?", "What's your love language, honestly?",
  "What's a fear you'd like to get over?", "What's your favorite photo of us and why?", "What's something new you learned recently?",
  "If you could have any superpower for a day, what would it be?", "What's the best compliment you've ever gotten?",
  "What would your perfect birthday look like?", "What's one word that describes us?", "What's a tradition you'd like us to start?",
  "What's something that always makes you think of me?", "If we wrote a book about us, what would the title be?",
  "What's a food you want us to cook together?", "What made you smile the most this week?", "What's one thing on your bucket list?",
  "How do you like to be comforted when you're sad?", "What's your favorite season and why?", "What's a song you've had on repeat lately?",
  "What's something you wish we did more often?", "What's one thing you admire about me?", "What would a perfect day off look like for you?",
  "What's the weirdest dream you remember?", "If we could live in any city, which would it be?", "What's a small win you had today?",
  "What's a hobby you'd love to pick up?", "What's your go-to karaoke song?", "What's a memory that always makes you laugh?",
  "What's one thing you're grateful for right now?", "What's a trip we should plan next?", "What does home feel like to you?",
  "What's something you want me to know today?",
];

const $ = (s) => document.querySelector(s);
// ---- Batch A: small platform helpers ----
const APP_VERSION = "soy-v77";

const prefersReducedMotion = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } };
const canVibrate = typeof navigator !== "undefined" && "vibrate" in navigator;
let hapticsOn;
function haptic(ms = 12) { if (hapticsOn !== false && canVibrate) { try { navigator.vibrate(ms); } catch { /* ignore */ } } }
// ---- Batch B: reliability (outbox, connection, undo/redo) ----
const isNetworkError = (e) => { const m = (e && e.message || "").toLowerCase(); return !navigator.onLine || /network|failed to fetch|load failed|timeout|timed out|fetch|connection|offline/.test(m); };
const isDemo = !CONFIG.supabaseUrl || CONFIG.supabaseUrl.includes("YOUR-");
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
const fmtCode = (c) => (c || "").replace(/(.{4})(.{4})/, "$1-$2");
const ls = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ } },
};
const isScheduled = (n) => !!n.show_at && new Date(n.show_at).getTime() > Date.now();
const fmtWhen = (iso) => new Date(iso).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" });
const pad2 = (x) => String(x).padStart(2, "0");
const localDateKey = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const toLocalInput = (d) => `${localDateKey(d)}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

// ================================================================ backends
// Both backends expose the same async interface.

function createSupabaseApi() {
  let sb, session, channel, extras, liveCh, inkCh, chatCh;
  const bucket = () => sb.storage.from("board-media");
  const urlCache = new Map();
  const must = ({ data, error }) => { if (error) throw new Error(error.message); return data; };
  const myId = () => session?.user?.id;

  return {
    async init() {
      // read what the email link put in the address before supabase-js tidies it away
      const q = new URLSearchParams(location.search);
      const h = new URLSearchParams(location.hash.slice(1));
      const handoff = q.get("handoff");
      const cameFromLink = h.has("access_token") || q.has("code") || h.has("error_description") || q.has("error_description");
      const linkError = h.get("error_description") || q.get("error_description");

      const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
      sb = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
      session = (await sb.auth.getSession()).data.session;
      sb.auth.onAuthStateChange((_e, s) => { session = s; });
      if (cameFromLink || handoff) history.replaceState(null, "", location.pathname);

      if (linkError) return { linkError: linkError.replace(/\+/g, " ") };
      if (handoff && session && cameFromLink) {
        // pass this sign-in to the app that asked for it, then forget it here
        await sb.rpc("put_handoff", { p_nonce: handoff, p_access: session.access_token, p_refresh: session.refresh_token });
        if (!isStandalone()) {
          sb.auth.stopAutoRefresh();
          Object.keys(localStorage).filter((k) => k.startsWith("sb-")).forEach((k) => localStorage.removeItem(k));
          session = null;
          return { landing: "linked" };
        }
      }
      return {};
    },
    hasSession: () => !!session,
    async sendLink(email, nonce) {
      const base = location.origin + location.pathname;
      const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: `${base}?handoff=${nonce}`, shouldCreateUser: true } });
      if (error) throw new Error(/rate|limit/i.test(error.message) ? "Too many emails sent. Wait a bit and try again." : error.message);
    },
    async claimHandoff(nonce) {
      const { data, error } = await sb.rpc("claim_handoff", { p_nonce: nonce });
      if (error || !data) return false;
      const res = await sb.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
      if (res.error) throw new Error(res.error.message);
      session = res.data.session;
      return true;
    },
    async account() {
      const { data } = await sb.auth.getUser();
      const u = data.user || session?.user || {};
      return { email: u.email || null, pending: u.new_email || null, anonymous: !!u.is_anonymous || !u.email };
    },
    async linkEmail(email) {
      const { error } = await sb.auth.updateUser({ email }, { emailRedirectTo: location.origin + location.pathname });
      if (error) throw new Error(error.message);
    },
    async signOut() {
      try {
        const reg = await navigator.serviceWorker?.ready;
        const sub = await reg?.pushManager?.getSubscription();
        if (sub) { await sb.from("push_subs").delete().eq("endpoint", sub.endpoint); await sub.unsubscribe(); }
      } catch { /* ignore */ }
      await sb.auth.signOut({ scope: "local" });
      session = null;
    },
    async me() {
      if (!session) return null;
      // "muted" arrives with the v2 database upgrade; fall back if it isn't there yet
      let res = await sb.from("profiles").select("id,name,color,muted,avatar_path,bio").eq("id", myId());
      if (res.error) res = await sb.from("profiles").select("id,name,color,muted").eq("id", myId());
      if (res.error) res = await sb.from("profiles").select("id,name,color").eq("id", myId());
      const rows = must(res);
      return rows[0] || null;
    },
    async signIn(name, color) {
      if (!session) throw new Error("Please sign in with your email first.");
      must(await sb.from("profiles").upsert({ id: myId(), name, color }));
      return { id: myId(), name, color, muted: [] };
    },
    // Custom themes live in the user_themes table (upgrade-v13). Columns: id uuid, owner_id, name, json, updated_at.
    async listThemes() {
      const { data, error } = await sb.from("user_themes").select("id,name,json,updated_at").eq("owner_id", myId());
      if (error) throw new Error(error.message);
      return data || [];
    },
    async upsertTheme(t) {
      must(await sb.from("user_themes").upsert({ id: t.id, owner_id: myId(), name: t.name, json: { base: t.base, tokens: t.tokens }, updated_at: new Date(t.updatedAt).toISOString() }));
    },
    async deleteTheme(id) {
      must(await sb.from("user_themes").delete().eq("id", id));
    },
    async updateProfile(patch) {
      must(await sb.from("profiles").update(patch).eq("id", myId()));
    },
    async myBoards() {
      let res = await sb.from("board_members").select("board_id, joined_at, bg, boards(id, code, created_by, bg_mode, bg, name, photo_path, locked, listed)").eq("user_id", myId());
      if (res.error) res = await sb.from("board_members").select("board_id, joined_at, boards(id, code, created_by)").eq("user_id", myId());
      return must(res).filter((r) => r.boards).map((r) => ({ ...r.boards, my_bg: r.bg || null, joined_at: r.joined_at }));
    },
    async roomPeople(boardId) {
      const rows = must(await sb.from("board_members").select("user_id").eq("board_id", boardId));
      const ids = rows.map((r) => r.user_id).filter((id) => id !== myId());
      if (!ids.length) return [];
      return must(await sb.from("profiles").select("id,name,color").in("id", ids));
    },
    async myBoard() {
      let res = await sb.from("board_members").select("board_id, bg, boards(id, code, created_by, bg_mode, bg, name, photo_path, locked, listed)").eq("user_id", myId()).order("joined_at", { ascending: false }).limit(1);
      if (res.error) res = await sb.from("board_members").select("board_id, boards(id, code, created_by)").eq("user_id", myId()).order("joined_at", { ascending: false }).limit(1);
      const rows = must(res);
      return rows[0] ? { ...rows[0].boards, my_bg: rows[0].bg || null } : null;
    },
    async getBoard(boardId) {
      let res = await sb.from("boards").select("id, code, created_by, bg_mode, bg, name, photo_path, locked").eq("id", boardId).single();
      if (res.error) res = await sb.from("boards").select("id, code, created_by, bg_mode, bg").eq("id", boardId).single();
      return res.error ? null : res.data;
    },
    async setBoardBg(boardId, mode, bg, setBg) { must(await sb.rpc("set_board_bg", { b: boardId, p_mode: mode, p_bg: bg, p_set_bg: setBg })); },
    async renameRoom(boardId, name) { must(await sb.rpc("rename_room", { p_board: boardId, p_name: name })); },
    async setRoomPhoto(boardId, path) { must(await sb.rpc("set_room_photo", { p_board: boardId, p_path: path })); },
    fx(key, handler) {   // a shared channel for room-wide effects (the room map uses "map")
      const ch = sb.channel("fx-" + key, { config: { broadcast: { self: false } } });
      ch.on("broadcast", { event: "fx" }, ({ payload }) => handler(payload));
      ch.subscribe();
      return { send: (payload) => ch.send({ type: "broadcast", event: "fx", payload }) };
    },
    async setRoomLock(boardId, locked) { must(await sb.rpc("set_room_lock", { p_board: boardId, p_locked: locked })); },
    async setRoomListed(boardId, listed) { must(await sb.rpc("set_room_listed", { p_board: boardId, p_listed: listed })); },
    async takeRoomAdmin(boardId) { must(await sb.rpc("take_room_admin", { p_board: boardId })); },
    async listRooms() { return must(await sb.rpc("list_rooms")) || []; },
    async joinRoomById(boardId) { return must(await sb.rpc("join_room_by_id", { p_board: boardId })); },
    async uploadRoomPhoto(boardId, blob) {
      const path = `${boardId}/room-${Date.now()}.jpg`;
      must(await bucket().upload(path, blob, { contentType: "image/jpeg", upsert: false }));
      return path;
    },
    async removeRoomFile(path) { try { await bucket().remove([path]); } catch { /* already gone */ } },
    async setMyBg(boardId, bg) { must(await sb.rpc("set_my_bg", { b: boardId, p_bg: bg })); },
    async requestBg(boardId, path, kind) { return must(await sb.from("bg_requests").insert({ board_id: boardId, user_id: myId(), media_path: path, kind }).select().single()); },
    async listBgRequests(boardId) { return must(await sb.from("bg_requests").select("*").eq("board_id", boardId).order("created_at", { ascending: false }).limit(30)); },
    async reviewBg(id, approve) { return must(await sb.rpc("review_bg_request", { r: id, approve })); },
    async listMessages(boardId) {
      const rows = must(await sb.from("messages").select("*").eq("board_id", boardId).order("created_at", { ascending: false }).limit(800));
      return rows.reverse();
    },
    async sendMessage(m) { return must(await sb.from("messages").insert(m).select().single()); },
    async listReads(boardId) { return must(await sb.from("message_reads").select("*").eq("board_id", boardId)); },
    async markRead(boardId, peer) { must(await sb.from("message_reads").upsert({ board_id: boardId, user_id: myId(), peer, read_at: new Date().toISOString() })); },
    async unfurl(url) {
      try { const { data } = await sb.functions.invoke("notify", { body: { unfurl: url } }); return data || {}; } catch { return {}; }
    },
    async createBoard() { return must(await sb.rpc("create_board")); },
    async joinBoard(code) { return must(await sb.rpc("join_board", { p_code: code })); },
    async members(boardId) {
      let res = await sb.from("board_members").select("user_id,last_seen,joined_at").eq("board_id", boardId);
      if (res.error) res = await sb.from("board_members").select("user_id,joined_at").eq("board_id", boardId);
      const rows = must(res) || [];
      if (!rows.length) return [];
      let pres = await sb.from("profiles").select("id,name,color,avatar_path,bio").in("id", rows.map((r) => r.user_id));
      if (pres.error) pres = await sb.from("profiles").select("id,name,color").in("id", rows.map((r) => r.user_id));
      const profs = must(pres);
      const byId = Object.fromEntries(rows.map((r) => [r.user_id, r]));
      return profs.map((p) => ({ ...p, last_seen: byId[p.id]?.last_seen || null, joined_at: byId[p.id]?.joined_at }))
        .sort((x, y) => (x.joined_at < y.joined_at ? -1 : 1));
    },
    async touchSeen(boardId) { try { await sb.rpc("touch_seen", { b: boardId }); } catch { /* v4 */ } },
    async listStrokes(boardId) { return must(await sb.from("strokes").select("*").eq("board_id", boardId).order("created_at")); },
    async addStroke(s) { must(await sb.from("strokes").insert(s)); },
    async deleteStroke(id) { must(await sb.from("strokes").delete().eq("id", id)); },
    async updateStroke(id, patch) { must(await sb.from("strokes").update(patch).eq("id", id)); },
    async deleteMedia(path) { try { await bucket().remove([path]); } catch { /* ignore */ } },
    async removeMember(boardId, userId) {
      must(await sb.from("board_members").delete().eq("board_id", boardId).eq("user_id", userId));
    },
    async leaveBoard(boardId) {
      must(await sb.from("board_members").delete().eq("board_id", boardId).eq("user_id", myId()));
    },
    async deleteBoard(boardId) {
      // photos, drawings and voice notes live in storage, which doesn't cascade: clear them first
      try {
        const files = must(await bucket().list(boardId, { limit: 1000 })) || [];
        if (files.length) await bucket().remove(files.map((f) => `${boardId}/${f.name}`));
      } catch (e) { console.warn("media cleanup", e); }
      const { error } = await sb.rpc("delete_board", { b: boardId });
      if (error) throw new Error(/function .*delete_board|schema cache/i.test(error.message) ? "Run upgrade-v3.sql in Supabase first (see SETUP)." : error.message);
    },
    async listNotes(boardId) {
      return must(await sb.from("notes").select("*").eq("board_id", boardId).order("z", { ascending: true }));
    },
    async addNote(n) { return must(await sb.from("notes").insert(n).select().single()); },
    async updateNote(id, patch) {
      must(await sb.from("notes").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id));
    },
    async deleteNote(n) {
      must(await sb.from("notes").delete().eq("id", n.id));
      if (n.media_path) await bucket().remove([n.media_path]);
    },
    async markSeen(ids) {
      if (ids.length) must(await sb.from("notes").update({ seen_at: new Date().toISOString() }).in("id", ids).is("seen_at", null));
    },
    async uploadMedia(boardId, blob, ext) {
      const path = `${boardId}/${uid()}.${ext}`;
      must(await bucket().upload(path, blob, { contentType: (blob.type || "").split(";")[0], upsert: false }));
      return path;
    },
    async uploadAvatar(blob) {
      const path = `avatars/${myId()}-${Date.now()}.jpg`;
      must(await bucket().upload(path, blob, { contentType: "image/jpeg", upsert: true }));
      return path;
    },
    async mediaUrls(paths) {
      const need = paths.filter((p) => p && !urlCache.has(p));
      if (need.length) {
        const rows = must(await bucket().createSignedUrls(need, 60 * 60 * 24 * 7));
        rows.forEach((r) => r.signedUrl && urlCache.set(r.path, r.signedUrl));
      }
      return Object.fromEntries(paths.map((p) => [p, urlCache.get(p)]));
    },

    // reactions / replies / answers / check-ins (v2 database upgrade)
    async listReactions(boardId) { return must(await sb.from("reactions").select("note_id,user_id,emoji").eq("board_id", boardId)); },
    async listFeedbackThreads() { return must(await sb.from("feedback_threads_v").select("*").order("created_at", { ascending: false }).limit(300)); },
    async listFeedbackPosts() { return must(await sb.from("feedback_posts_v").select("*").order("created_at", { ascending: true }).limit(3000)); },
    async newFeedbackThread(title, body, anonymous) { must(await sb.rpc("feedback_new_thread", { p_title: title, p_body: body, p_anonymous: anonymous })); },
    async replyFeedback(thread, parent, body, anonymous) { must(await sb.rpc("feedback_reply", { p_thread: thread, p_parent: parent, p_body: body, p_anonymous: anonymous })); },
    async deleteFeedback(kind, id) { must(await sb.rpc("feedback_delete", { p_kind: kind, p_id: id })); },
    async reportFeedback(kind, id, reason) { must(await sb.rpc("feedback_report", { p_kind: kind, p_id: id, p_reason: reason })); },
    async isFeedbackAdmin() { const res = await sb.rpc("is_feedback_admin"); return !res.error && res.data === true; },
    async adminListReports() {
      const rows = must(await sb.rpc("admin_list_reports")) || [];
      return rows.map((r) => ({ kind: r.out_kind, target_id: r.out_target_id, body: r.out_body, title: r.out_title, anonymous: !!r.out_anonymous, author_name: r.out_author_name, reasons: r.out_reasons || [], count: r.out_count, first_reported: r.out_first_reported, hidden: !!r.out_hidden, thread_id: r.out_thread_id }));
    },
    async adminHide(kind, id) { must(await sb.rpc("admin_hide_post", { p_kind: kind, p_id: id })); },
    async adminRestore(kind, id) { must(await sb.rpc("admin_restore_post", { p_kind: kind, p_id: id })); },
    async adminDismiss(kind, id) { must(await sb.rpc("admin_dismiss_reports", { p_kind: kind, p_id: id })); },
    async listScores(boardId) { return must(await sb.from("board_scores").select("user_id,game,score,created_at").eq("board_id", boardId).order("score", { ascending: false }).limit(5000)); },
    async submitScore(boardId, game, score) { must(await sb.from("board_scores").insert({ board_id: boardId, user_id: myId(), game, score })); },
    async addReaction(r) { must(await sb.from("reactions").insert(r)); },
    async removeReaction(noteId, emoji) { must(await sb.from("reactions").delete().eq("note_id", noteId).eq("user_id", myId()).eq("emoji", emoji)); },
    async listReplies(boardId) { return must(await sb.from("replies").select("*").eq("board_id", boardId).order("created_at")); },
    async addReply(r) { return must(await sb.from("replies").insert(r).select().single()); },
    async listAnswers(boardId, since) { return must(await sb.from("answers").select("*").eq("board_id", boardId).gte("qdate", since).order("qdate", { ascending: false })); },
    async saveAnswer(boardId, qdate, body) { must(await sb.from("answers").upsert({ board_id: boardId, user_id: myId(), qdate, body })); },
    async answerStatus(boardId, qdate) {
      const rows = must(await sb.rpc("answer_status", { b: boardId, d: qdate })) || [];
      return rows.map((x) => (typeof x === "string" ? x : x.answer_status));
    },
    async listPings(boardId) { return must(await sb.from("pings").select("*").eq("board_id", boardId).order("created_at", { ascending: false }).limit(40)); },
    async sendPing(boardId, kind) { return must(await sb.from("pings").insert({ board_id: boardId, user_id: myId(), kind }).select().single()); },

    subscribe(boardId, h) {
      if (channel) sb.removeChannel(channel);
      if (extras) sb.removeChannel(extras);
      const f = `board_id=eq.${boardId}`;
      channel = sb.channel("board-" + boardId)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notes", filter: f }, (p) => h.onInsert(p.new))
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "notes", filter: f }, (p) => h.onUpdate(p.new))
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "notes" }, (p) => h.onDelete(p.old.id))
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "board_members", filter: f }, () => h.onMembers())
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "board_members" }, () => h.onMembers())
        .subscribe((status) => { try { h.onConn?.(status); } catch { /* ignore */ } });
      // the v2 tables get their own channel, so the board keeps working before the upgrade is run
      extras = sb.channel("extras-" + boardId)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "reactions", filter: f }, (p) => h.onReaction(p.new, false))
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "reactions" }, (p) => h.onReaction(p.old, true))
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "replies", filter: f }, (p) => h.onReply(p.new))
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "pings", filter: f }, (p) => h.onPing(p.new))
        .on("postgres_changes", { event: "*", schema: "public", table: "answers", filter: f }, () => h.onAnswer())
        .subscribe();
      // v4 table on its own channel too
      if (inkCh) sb.removeChannel(inkCh);
      inkCh = sb.channel("ink-" + boardId)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "strokes", filter: f }, (p) => h.onStroke(p.new, false))
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "strokes" }, (p) => h.onStroke(p.old, true))
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "strokes", filter: f }, (p) => h.onStroke(p.new, false))
        .subscribe();
      // v6 tables on their own channel too
      if (chatCh) sb.removeChannel(chatCh);
      chatCh = sb.channel("chat-" + boardId)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: f }, (p) => h.onMessage(p.new))
        .on("postgres_changes", { event: "*", schema: "public", table: "message_reads", filter: f }, (p) => h.onRead(p.new))
        .on("postgres_changes", { event: "*", schema: "public", table: "bg_requests", filter: f }, (p) => h.onBgRequest(p.new))
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "boards", filter: `id=eq.${boardId}` }, (p) => h.onBoard(p.new))
        .subscribe();
    },
    live(boardId, me, h) {
      if (liveCh) sb.removeChannel(liveCh);
      let presence = { name: me.name, color: me.color, visible: true, doodling: false };
      liveCh = sb.channel("live-" + boardId, { config: { broadcast: { self: false }, presence: { key: me.id } } });
      liveCh.on("broadcast", { event: "m" }, ({ payload }) => h.onMessage(payload));
      liveCh.on("presence", { event: "sync" }, () => {
        const out = {};
        for (const [k, metas] of Object.entries(liveCh.presenceState())) out[k] = metas[metas.length - 1];
        h.onPresence(out);
      });
      liveCh.subscribe((status) => { if (status === "SUBSCRIBED") liveCh.track(presence); });
      return {
        send: (p) => liveCh.send({ type: "broadcast", event: "m", payload: p }),
        track: (p) => { presence = { ...presence, ...p }; liveCh.track(presence); },
      };
    },
    church(me, h, boardId) {
      // one channel per room: presence only (name, colour, seat), so only people in this room see each other
      let presence = { name: me.name, color: me.color, seat: null };
      const chCh = sb.channel("church-" + boardId, { config: { presence: { key: me.id }, broadcast: { self: false } } });
      chCh.on("broadcast", { event: "chat" }, ({ payload }) => h.onChat && h.onChat(payload));
      chCh.on("presence", { event: "sync" }, () => {
        const out = {};
        for (const [k, metas] of Object.entries(chCh.presenceState())) out[k] = metas[metas.length - 1];
        h.onPresence(out);
      });
      chCh.subscribe((status) => { if (status === "SUBSCRIBED") chCh.track(presence); });
      return {
        track: (p) => { presence = { ...presence, ...p }; chCh.track(presence); },
        say: (msg) => chCh.send({ type: "broadcast", event: "chat", payload: msg }),
        close: () => sb.removeChannel(chCh),
      };
    },
    async savePushSub(sub) {
      must(await sb.from("push_subs").upsert({ endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth, user_id: myId() }));
    },
    async notify(boardId, type = "note", extra = {}) {
      try {
        const { data, error } = await sb.functions.invoke("notify", { body: { board_id: boardId, type, ...extra } });
        if (error) {
          let detail = error.message;
          const res = error.context;
          if (res && typeof res.status === "number") {
            let body = "";
            try { body = await res.clone().text(); } catch { /* no body */ }
            try { const j = JSON.parse(body); body = j.error || j.msg || j.message || body; } catch { /* plain text */ }
            detail = `${res.status} ${body || res.statusText || ""}`.trim();
          }
          return { error: detail };
        }
        return data;
      } catch (e) { console.warn("notify failed", e); return { error: e.message }; }
    },
    pushReady: () => !!CONFIG.vapidPublicKey && !CONFIG.vapidPublicKey.includes("YOUR-"),
  };
}

// Demo backend: localStorage + BroadcastChannel. Each browser tab is its own "person".
function createDemoApi() {
  const KEY = "soy-demo-db";
  const blank = () => ({ profiles: {}, boards: {}, members: [], notes: [], media: {}, reactions: [], replies: [], answers: [], pings: [], strokes: [], messages: [], reads: [], bgreqs: [], scores: [], ttt: [], c8: [], fb: { threads: [], posts: [], reports: [] } });
  const canSee = (m) => !m.to_id || m.sender_id === meId() || m.to_id === meId();
  const db = () => ({ ...blank(), ...ls.get(KEY, {}) });
  const save = (d) => ls.set(KEY, d);
  const bc = "BroadcastChannel" in window ? new BroadcastChannel("soy-demo") : null;
  // Open the app with ?as=2 in a second tab to play the other person.
  const who = new URLSearchParams(location.search).get("as") || "";
  const meId = () => { const k = "soy-demo-me" + who; let id = localStorage.getItem(k); if (!id) { id = uid(); localStorage.setItem(k, id); } return id; };
  const hiddenFromMe = (n) => isScheduled(n) && n.author_id !== meId();
  let handlers = null;
  const emit = (msg) => bc && bc.postMessage(msg);
  if (bc) bc.onmessage = (e) => {
    if (!handlers) return;
    const m = e.data;
    if (m.type === "insert" && !hiddenFromMe(m.note)) handlers.onInsert(m.note);
    if (m.type === "update" && !hiddenFromMe(m.note)) handlers.onUpdate(m.note);
    if (m.type === "delete") handlers.onDelete(m.id);
    if (m.type === "members") handlers.onMembers();
    if (m.type === "reaction") handlers.onReaction(m.row, m.del);
    if (m.type === "reply") handlers.onReply(m.row);
    if (m.type === "ping") handlers.onPing(m.row);
    if (m.type === "answer") handlers.onAnswer();
    if (m.type === "stroke") handlers.onStroke(m.row, m.del);
    if (m.type === "message" && canSee(m.row)) handlers.onMessage(m.row);
    if (m.type === "read") handlers.onRead(m.row);
    if (m.type === "bgreq") { const b = db().boards[m.row.board_id]; if (m.row.user_id === meId() || b?.created_by === meId()) handlers.onBgRequest(m.row); }
    if (m.type === "board") handlers.onBoard(m.row);
  };
  const code = () => Array.from({ length: 8 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");

  return {
    async init() { return {}; },
    hasSession: () => true,
    async sendLink() {},
    async claimHandoff() { return true; },
    async account() { return { email: "demo@example.com", pending: null, anonymous: false }; },
    async linkEmail() {},
    async signOut() { localStorage.removeItem("soy-demo-me" + who); },
    async me() { return db().profiles[meId()] || null; },
    async signIn(name, color) { const d = db(); d.profiles[meId()] = { id: meId(), name, color, muted: [] }; save(d); return d.profiles[meId()]; },
    async listThemes() { return []; },          // demo mode keeps themes on this device only
    async upsertTheme() {},
    async deleteTheme() {},
    async updateProfile(patch) { const d = db(); Object.assign(d.profiles[meId()], patch); save(d); emit({ type: "members" }); },
    async myBoards() {
      const d = db();
      return d.members.filter((m) => m.user_id === meId() && d.boards[m.board_id]).map((m) => ({ bg_mode: "shared", bg: null, ...d.boards[m.board_id], my_bg: m.bg || null, joined_at: m.joined_at || d.boards[m.board_id].created_at || "" }));
    },
    async roomPeople(boardId) {
      const d = db();
      return d.members.filter((m) => m.board_id === boardId && m.user_id !== meId()).map((m) => d.profiles[m.user_id]).filter(Boolean);
    },
    async myBoard() { const d = db(); const m = d.members.find((x) => x.user_id === meId()); return m ? { bg_mode: "shared", bg: null, ...d.boards[m.board_id], my_bg: m.bg || null } : null; },
    async getBoard(boardId) { return { bg_mode: "shared", bg: null, ...db().boards[boardId] }; },
    async setBoardBg(boardId, mode, bg, setBg) {
      const d = db(); const b = d.boards[boardId];
      if (b.created_by !== meId()) throw new Error("Only the board owner can change this");
      if (mode) b.bg_mode = mode; if (setBg) b.bg = bg; save(d); emit({ type: "board", row: b });
    },
    async renameRoom(boardId, name) { const d = db(); const b = d.boards[boardId]; if (!b) throw new Error("No room"); b.name = (name || "").trim().slice(0, 40) || null; save(d); emit({ type: "board", row: b }); },
    async setRoomPhoto(boardId, path) { const d = db(); const b = d.boards[boardId]; if (!b) throw new Error("No room"); b.photo_path = path || null; save(d); emit({ type: "board", row: b }); },
    async listRooms() { const d = db(); return Object.values(d.boards).filter((b) => b.listed !== false || d.members.some((m) => m.board_id === b.id && m.user_id === meId())).map((b) => ({ id: b.id, name: b.name || null, photo_path: b.photo_path || null, locked: !!b.locked, member_count: d.members.filter((m) => m.board_id === b.id).length, is_member: d.members.some((m) => m.board_id === b.id && m.user_id === meId()) })); },
    async joinRoomById(boardId) {
      const d = db(); const b = d.boards[boardId]; if (!b) throw new Error("No room");
      if (!d.members.some((m) => m.board_id === boardId && m.user_id === meId())) {
        if (b.locked) throw new Error(LOCKED_MSG);
        if (d.members.filter((m) => m.board_id === boardId).length >= 10) throw new Error("That board is full (10 people max)");
        d.members.push({ board_id: boardId, user_id: meId(), joined_at: new Date().toISOString() }); save(d); emit({ type: "members" });
      }
      return b;
    },
    async takeRoomAdmin(boardId) { const d = db(); const b = d.boards[boardId]; if (!b) throw new Error("No room"); b.created_by = meId(); save(d); emit({ type: "board", row: b }); },
    async setRoomListed(boardId, listed) { const d = db(); const b = d.boards[boardId]; if (!b) throw new Error("No room"); if (b.created_by !== meId()) throw new Error("Only the room owner can change this"); b.listed = !!listed; save(d); emit({ type: "board", row: b }); },
    fx(key, handler) {
      const bc = "BroadcastChannel" in window ? new BroadcastChannel("soy-fx-" + key) : null;
      if (bc) bc.onmessage = (e) => handler(e.data);
      return { send: (payload) => { if (bc) bc.postMessage(payload); } };
    },
    async setRoomLock(boardId, locked) { const d = db(); const b = d.boards[boardId]; if (!b) throw new Error("No room"); b.locked = !!locked; save(d); emit({ type: "board", row: b }); },
    async uploadRoomPhoto(boardId, blob) {
      const dataUrl = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
      const path = `${boardId}/room-${Date.now()}.jpg`; const d = db(); d.media[path] = dataUrl; save(d); return path;
    },
    async removeRoomFile(path) { const d = db(); delete d.media[path]; save(d); },
    async setMyBg(boardId, bg) { const d = db(); const m = d.members.find((x) => x.board_id === boardId && x.user_id === meId()); if (m) { m.bg = bg; save(d); } },
    async requestBg(boardId, path, kind) {
      const d = db(); const row = { id: uid(), board_id: boardId, user_id: meId(), media_path: path, kind, status: "pending", created_at: new Date().toISOString() };
      d.bgreqs.push(row); save(d); emit({ type: "bgreq", row }); return row;
    },
    async listBgRequests(boardId) {
      const d = db(); const owner = d.boards[boardId]?.created_by === meId();
      return d.bgreqs.filter((r) => r.board_id === boardId && (owner || r.user_id === meId())).sort((x, y) => (x.created_at < y.created_at ? 1 : -1));
    },
    async reviewBg(id, approve) {
      const d = db(); const r = d.bgreqs.find((x) => x.id === id); const b = d.boards[r.board_id];
      if (b.created_by !== meId()) throw new Error("Only the board owner can review requests");
      r.status = approve ? "approved" : "declined"; r.reviewed_at = new Date().toISOString();
      if (approve) b.bg = { type: r.kind, path: r.media_path };
      save(d); emit({ type: "bgreq", row: r }); if (approve) emit({ type: "board", row: b });
      return { user_id: r.user_id };
    },
    async listMessages(boardId) { return db().messages.filter((m) => m.board_id === boardId && canSee(m)); },
    async sendMessage(m) { if (typeof window !== "undefined" && window.__simOffline) throw new Error("Failed to fetch (simulated offline)"); const d = db(); const row = { ...m, id: uid(), created_at: new Date().toISOString() }; d.messages.push(row); save(d); emit({ type: "message", row }); return row; },
    async listReads(boardId) { return db().reads.filter((r) => r.board_id === boardId); },
    async markRead(boardId, peer) {
      const d = db(); d.reads = d.reads.filter((r) => !(r.board_id === boardId && r.user_id === meId() && r.peer === peer));
      const row = { board_id: boardId, user_id: meId(), peer, read_at: new Date().toISOString() }; d.reads.push(row); save(d); emit({ type: "read", row });
    },
    async unfurl(url) { try { const u = new URL(url); return { title: decodeURIComponent(u.pathname.split("/").filter(Boolean).pop() || u.hostname).replace(/[-_]/g, " "), thumb: null, author: u.hostname }; } catch { return {}; } },
    async createBoard() { const d = db(); const b = { id: uid(), code: code(), created_by: meId() }; d.boards[b.id] = b; d.members.push({ board_id: b.id, user_id: meId() }); save(d); return b; },
    async joinBoard(c) {
      const d = db(); const clean = (c || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      const b = Object.values(d.boards).find((x) => x.code === clean);
      if (!b) throw new Error("No board with that code");
      if (!d.members.some((m) => m.board_id === b.id && m.user_id === meId())) {
        if (b.locked) throw new Error(LOCKED_MSG);
        if (d.members.filter((m) => m.board_id === b.id).length >= 10) throw new Error("That board is full (10 people max)");
        d.members.push({ board_id: b.id, user_id: meId(), joined_at: new Date().toISOString() }); save(d); emit({ type: "members" });
      }
      return b;
    },
    async members(boardId) {
      const d = db();
      return d.members.filter((m) => m.board_id === boardId).map((m) => d.profiles[m.user_id] && { ...d.profiles[m.user_id], last_seen: m.last_seen || null }).filter(Boolean);
    },
    async touchSeen(boardId) { const d = db(); const m = d.members.find((x) => x.board_id === boardId && x.user_id === meId()); if (m) { m.last_seen = new Date().toISOString(); save(d); } },
    async listStrokes(boardId) { return db().strokes.filter((s) => s.board_id === boardId); },
    async addStroke(s) { const d = db(); const row = { ...s, created_at: new Date().toISOString() }; d.strokes.push(row); save(d); emit({ type: "stroke", row, del: false }); },
    async deleteStroke(id) { const d = db(); d.strokes = d.strokes.filter((s) => s.id !== id); save(d); emit({ type: "stroke", row: { id }, del: true }); },
    async updateStroke(id, patch) { const d = db(); const s = d.strokes.find((x) => x.id === id); if (!s) return; Object.assign(s, patch); save(d); emit({ type: "stroke", row: s, del: false }); },
    async deleteMedia(path) { const d = db(); delete d.media[path]; save(d); },
    async removeMember(boardId, userId) { const d = db(); d.members = d.members.filter((m) => !(m.board_id === boardId && m.user_id === userId)); save(d); emit({ type: "members" }); },
    async leaveBoard(boardId) { return this.removeMember(boardId, meId()); },
    async deleteBoard(boardId) {
      const d = db(); const b = d.boards[boardId];
      const mine = d.members.filter((m) => m.board_id === boardId);
      if (!b || !(b.created_by === meId() || (mine.length === 1 && mine[0].user_id === meId()))) throw new Error("Only the person who made this board can delete it. You can leave it instead.");
      delete d.boards[boardId];
      for (const n of d.notes) if (n.board_id === boardId && n.media_path) delete d.media[n.media_path];
      for (const k of ["members", "notes", "reactions", "replies", "answers", "pings", "strokes", "messages", "reads", "bgreqs"]) d[k] = d[k].filter((x) => x.board_id !== boardId);
      save(d); emit({ type: "members" });
    },
    async listNotes(boardId) { return db().notes.filter((n) => n.board_id === boardId && !hiddenFromMe(n)).sort((a, b) => a.z - b.z); },
    async addNote(n) { if (typeof window !== "undefined" && window.__simOffline) throw new Error("Failed to fetch (simulated offline)"); const d = db(); const row = { pinned: false, ...n, id: uid(), created_at: new Date().toISOString() }; d.notes.push(row); save(d); emit({ type: "insert", note: row }); return row; },
    async updateNote(id, patch) {
      const d = db(); const n = d.notes.find((x) => x.id === id); if (!n) return;
      const looks = ["body", "color", "media_path", "meta", "kind", "scale", "rot", "flip_x", "flip_y", "show_at"];
      const owner = d.boards[n.board_id]?.created_by;
      if (looks.some((k) => k in patch && JSON.stringify(patch[k]) !== JSON.stringify(n[k])) && n.author_id !== meId() && owner !== meId())
        throw new Error("Only the person who made this, or the board owner, can change it");
      Object.assign(n, patch); save(d); emit({ type: "update", note: n });
    },
    async deleteNote(n) {
      const d = db(); d.notes = d.notes.filter((x) => x.id !== n.id); if (n.media_path) delete d.media[n.media_path];
      d.reactions = d.reactions.filter((r) => r.note_id !== n.id); d.replies = d.replies.filter((r) => r.note_id !== n.id);
      save(d); emit({ type: "delete", id: n.id });
    },
    async markSeen(ids) {
      const d = db(); const now = new Date().toISOString();
      for (const n of d.notes) if (ids.includes(n.id) && !n.seen_at) { n.seen_at = now; emit({ type: "update", note: n }); }
      save(d);
    },
    async uploadMedia(boardId, blob, ext) {
      const dataUrl = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
      const path = `${boardId}/${uid()}.${ext}`; const d = db(); d.media[path] = dataUrl; save(d); return path;
    },
    async mediaUrls(paths) { const d = db(); return Object.fromEntries(paths.map((p) => [p, d.media[p]])); },
    async uploadAvatar(blob) {
      const dataUrl = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
      const path = `avatars/${meId()}-${Date.now()}.jpg`; const d = db(); d.media[path] = dataUrl; save(d); return path;
    },
    async listReactions(boardId) { return db().reactions.filter((r) => r.board_id === boardId); },
    _fbShape(d, row, isPost) {
      const author = d.profiles[row.author_id] || {};
      const deleted = !!row.deleted_at;
      return {
        id: row.id, thread_id: isPost ? row.thread_id : undefined, parent_post_id: isPost ? (row.parent_post_id || null) : undefined,
        title: !isPost && !deleted && !row.hidden_at ? row.title : (isPost ? undefined : null),
        body: deleted || row.hidden_at ? null : row.body, anonymous: !!row.anonymous, created_at: row.created_at, deleted_at: row.deleted_at || null, is_hidden: !!row.hidden_at,
        author_name: row.anonymous ? null : (author.name || "Someone"), author_avatar: row.anonymous ? null : (author.avatar_path || null),
        is_mine: row.author_id === meId(),
        reply_count: isPost ? undefined : d.fb.posts.filter((p) => p.thread_id === row.id && !p.deleted_at).length,
      };
    },
    async listFeedbackThreads() { const d = db(); return d.fb.threads.map((t) => this._fbShape(d, t, false)).sort((a, b) => b.created_at.localeCompare(a.created_at)); },
    async listFeedbackPosts() { const d = db(); return d.fb.posts.map((p) => this._fbShape(d, p, true)).sort((a, b) => a.created_at.localeCompare(b.created_at)); },
    async newFeedbackThread(title, body, anonymous) { const d = db(); d.fb.threads.push({ id: uid(), author_id: meId(), title: title.trim().slice(0, 80), body: body.trim().slice(0, 2000), anonymous: !!anonymous, created_at: new Date().toISOString(), deleted_at: null }); save(d); },
    async replyFeedback(thread, parent, body, anonymous) {
      const d = db();
      const t = d.fb.threads.find((x) => x.id === thread); if (!t || t.deleted_at) throw new Error("That thread was deleted");
      if (parent && !d.fb.posts.some((p) => p.id === parent && p.thread_id === thread && !p.deleted_at)) throw new Error("That reply was deleted");
      d.fb.posts.push({ id: uid(), thread_id: thread, parent_post_id: parent || null, author_id: meId(), body: body.trim().slice(0, 2000), anonymous: !!anonymous, created_at: new Date().toISOString(), deleted_at: null }); save(d);
    },
    async deleteFeedback(kind, id) {
      const d = db(); const list = kind === "thread" ? d.fb.threads : d.fb.posts;
      const row = list.find((x) => x.id === id && x.author_id === meId() && !x.deleted_at);
      if (!row) throw new Error("You can only delete your own posts");
      row.deleted_at = new Date().toISOString(); save(d);
    },
    async isFeedbackAdmin() { return true; },
    async adminListReports() {
      const d = db(); const targets = new Map();
      for (const r of d.fb.reports) {
        const key = r.kind + "|" + r.target_id;
        if (!targets.has(key)) targets.set(key, { kind: r.kind, id: r.target_id, reports: [] });
        targets.get(key).reports.push(r);
      }
      const out = [];
      for (const t of targets.values()) {
        const row = (t.kind === "thread" ? d.fb.threads : d.fb.posts).find((x) => x.id === t.id);
        if (!row || row.deleted_at) continue;
        const open = t.reports.filter((x) => x.status === "open");
        if (!open.length && !row.hidden_at) continue;
        const author = d.profiles[row.author_id] || {};
        out.push({ kind: t.kind, target_id: t.id, body: row.body, title: t.kind === "thread" ? row.title : null, anonymous: !!row.anonymous,
          author_name: row.anonymous ? null : (author.name || "Someone"), reasons: t.reports.map((x) => x.reason), count: t.reports.length,
          first_reported: t.reports.map((x) => x.created_at).sort()[0], hidden: !!row.hidden_at, thread_id: t.kind === "post" ? row.thread_id : t.id });
      }
      return out.sort((a, b) => b.count - a.count);
    },
    async adminHide(kind, id) { const d = db(); const row = (kind === "thread" ? d.fb.threads : d.fb.posts).find((x) => x.id === id); if (!row) throw new Error("Not found"); row.hidden_at = new Date().toISOString(); row.hidden_by = meId(); d.fb.reports.forEach((r) => { if (r.kind === kind && r.target_id === id && r.status === "open") { r.status = "actioned"; r.resolved_at = new Date().toISOString(); } }); save(d); },
    async adminRestore(kind, id) { const d = db(); const row = (kind === "thread" ? d.fb.threads : d.fb.posts).find((x) => x.id === id); if (!row) throw new Error("Not found"); row.hidden_at = null; row.hidden_by = null; save(d); },
    async adminDismiss(kind, id) { const d = db(); d.fb.reports.forEach((r) => { if (r.kind === kind && r.target_id === id && r.status === "open") { r.status = "dismissed"; r.resolved_at = new Date().toISOString(); } }); save(d); },
    async reportFeedback(kind, id, reason) { const d = db(); if (d.fb.reports.some((r) => r.kind === kind && r.target_id === id && r.reporter_id === meId())) throw new Error("You already reported this"); d.fb.reports.push({ id: uid(), kind, target_id: id, reporter_id: meId(), reason: reason.slice(0, 200), created_at: new Date().toISOString(), status: "open" }); save(d); },
    async listScores(boardId) { return db().scores.filter((s) => s.board_id === boardId).map((s) => ({ user_id: s.user_id, game: s.game, score: s.score, created_at: s.created_at })); },
    async submitScore(boardId, game, score) { const d = db(); d.scores.push({ id: uid(), board_id: boardId, user_id: meId(), game, score, created_at: new Date().toISOString() }); save(d); },
    async addReaction(r) { const d = db(); d.reactions.push(r); save(d); emit({ type: "reaction", row: r, del: false }); },
    async removeReaction(noteId, emoji) {
      const d = db(); const row = { note_id: noteId, user_id: meId(), emoji };
      d.reactions = d.reactions.filter((r) => !(r.note_id === noteId && r.user_id === meId() && r.emoji === emoji)); save(d);
      emit({ type: "reaction", row, del: true });
    },
    async listReplies(boardId) { return db().replies.filter((r) => r.board_id === boardId); },
    async addReply(r) { const d = db(); const row = { ...r, id: uid(), created_at: new Date().toISOString() }; d.replies.push(row); save(d); emit({ type: "reply", row }); return row; },
    async listAnswers(boardId, since) {
      const d = db(); const mine = new Set(d.answers.filter((a) => a.board_id === boardId && a.user_id === meId()).map((a) => a.qdate));
      return d.answers.filter((a) => a.board_id === boardId && a.qdate >= since && (a.user_id === meId() || mine.has(a.qdate)))
        .sort((a, b) => (a.qdate < b.qdate ? 1 : -1));
    },
    async saveAnswer(boardId, qdate, body) {
      const d = db(); d.answers = d.answers.filter((a) => !(a.board_id === boardId && a.user_id === meId() && a.qdate === qdate));
      d.answers.push({ board_id: boardId, user_id: meId(), qdate, body, created_at: new Date().toISOString() }); save(d); emit({ type: "answer" });
    },
    async answerStatus(boardId, qdate) { return db().answers.filter((a) => a.board_id === boardId && a.qdate === qdate).map((a) => a.user_id); },
    async listPings(boardId) { return db().pings.filter((p) => p.board_id === boardId).sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 40); },
    async sendPing(boardId, kind) { const d = db(); const row = { id: uid(), board_id: boardId, user_id: meId(), kind, created_at: new Date().toISOString() }; d.pings.push(row); save(d); emit({ type: "ping", row }); return row; },
    subscribe(boardId, h) { handlers = h; },
    live(boardId, me, h) {
      const ch = "BroadcastChannel" in window ? new BroadcastChannel("soy-live-" + boardId) : null;
      const peers = {}; let presence = { name: me.name, color: me.color, visible: true, doodling: false };
      const pub = () => h.onPresence({ ...peers, [me.id]: presence });
      const post = (m) => ch && ch.postMessage({ ...m, from: me.id });
      if (ch) ch.onmessage = (e) => {
        const m = e.data; if (m.from === me.id) return;
        if (m.k === "m") h.onMessage(m.p);
        if (m.k === "pres") { peers[m.from] = m.p; pub(); if (m.ask) post({ k: "pres", p: presence }); }
        if (m.k === "bye") { delete peers[m.from]; pub(); }
      };
      post({ k: "pres", p: presence, ask: true });
      addEventListener("pagehide", () => post({ k: "bye" }));
      pub();
      return { send: (p) => post({ k: "m", p }), track: (p) => { presence = { ...presence, ...p }; post({ k: "pres", p: presence }); pub(); } };
    },
    church(me, h, boardId) {
      // demo mode: the same presence idea over BroadcastChannel, one channel per room
      const ch = "BroadcastChannel" in window ? new BroadcastChannel("soy-church-" + boardId) : null;
      const peers = {}; let presence = { name: me.name, color: me.color, seat: null };
      const pub = () => h.onPresence({ ...peers, [me.id]: presence });
      const post = (m) => ch && ch.postMessage({ ...m, from: me.id });
      if (ch) ch.onmessage = (e) => {
        const m = e.data; if (m.from === me.id) return;
        if (m.k === "pres") { peers[m.from] = m.p; pub(); if (m.ask) post({ k: "pres", p: presence }); }
        if (m.k === "bye") { delete peers[m.from]; pub(); }
        if (m.k === "chat" && h.onChat) h.onChat(m.p);
      };
      post({ k: "pres", p: presence, ask: true });
      const bye = () => post({ k: "bye" });
      addEventListener("pagehide", bye);
      pub();
      return {
        track: (p) => { presence = { ...presence, ...p }; post({ k: "pres", p: presence }); pub(); },
        say: (msg) => post({ k: "chat", p: msg }),
        close: () => { bye(); if (ch) ch.close(); },
      };
    },
    async savePushSub() {},
    async notify() { return { sent: 1, devices: 1, failures: [] }; },
    pushReady: () => true,
    meId,
  };
}

const api = isDemo ? createDemoApi() : createSupabaseApi();

// ================================================================ state
const state = {
  me: null,
  board: null,
  members: [],
  notes: new Map(),      // id -> note row
  reactions: new Map(),  // note id -> [{user_id, emoji}]
  replies: new Map(),    // note id -> [reply rows]
  pings: [],             // newest first
  presence: {},
  strokes: new Map(),    // board ink: id -> row
  view: { tx: 0, ty: 0, s: 1 },
  views: {},             // what each person is looking at: id -> {cx, cy, s, at}
  cursors: new Map(),    // id -> {x, y, at, touch}
  msgs: [],              // messages you can see, oldest first
  reads: new Map(),      // "user|peer" -> read_at
  bgReqs: [],            // background requests you can see
  playing: null,         // id of the music card playing on the board
  urls: {},              // media path -> url
  scale: 1,
  dragId: null,
  lastSeen: ls.get("soy-last-seen", 0),
  v2: true,              // false when the v2 database upgrade hasn't been run
};
let live = null;

// ================================================================ ui helpers
let toastTimer;
function toast(msg, ms = 2600, action = null) {
  const t = $("#toast"); t.innerHTML = ""; t.hidden = false;
  t.appendChild(document.createTextNode(msg));
  if (action && action.label && typeof action.fn === "function") {
    const b = document.createElement("button"); b.className = "toast-action"; b.textContent = action.label;
    b.onclick = () => { t.hidden = true; clearTimeout(toastTimer); action.fn(); };
    t.appendChild(b);
  }
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), ms);
}
function show(id) { for (const s of ["#login", "#linked", "#welcome", "#pair", "#menu", "#boardScreen"]) $(s).hidden = s !== id; }
function setError(el, msg) { el.textContent = msg || ""; el.hidden = !msg; }
function busy(btn, on, label) {
  if (on) { btn.dataset.label = btn.textContent; btn.textContent = label || "…"; btn.disabled = true; }
  else { btn.textContent = btn.dataset.label || btn.textContent; btn.disabled = false; }
}
function needsUpgrade() { toast("This needs the latest database update. Run upgrade-v2.sql in Supabase (see SETUP).", 5000); }

function swatchRow(container, selected, onPick, palette = "note") {
  container.innerHTML = "";
  for (const c of COLORS) {
    const b = document.createElement("button");
    b.className = "swatch"; b.type = "button"; b.setAttribute("aria-label", "Color " + c);
    b.style.background = palette === "bright" ? BRIGHT[c] : `var(--n${c.slice(1)})`;
    if (palette !== "bright") b.style.boxShadow = `inset 0 -5px 0 ${BRIGHT[c]}, inset 0 0 0 1px rgba(0,0,0,.12)`;
    b.setAttribute("aria-pressed", String(c === selected));
    b.onclick = () => { container.querySelectorAll(".swatch").forEach((x) => x.setAttribute("aria-pressed", "false")); b.setAttribute("aria-pressed", "true"); onPick(c); };
    container.appendChild(b);
  }
}

// Applies a built-in theme ("cork", ...) or a custom one ("custom:<id>") to this device.
// Extra built-in themes (Phase 4d). They are painted from tokens, the same way custom themes are.
const EXTRA_THEMES = [
  { id: "light-minimal", name: "Light minimal", base: "light", tokens: { bg: "#f4f5f7", surface: "#ffffff", surfaceInk: "#1d2028", muted: "#666c7a", line: "#e3e6ec", accent: "#1d2028", accentInk: "#ffffff", planet: "#c9d6ff", note: ["#fff8d6", "#ffe3ea", "#e0efff", "#e4f7e8", "#eee6ff", "#ffeedb"], gridSize: 28, gridOpacity: 0.025, radius: "m", shadow: "soft", motion: "normal" } },
  { id: "graphite", name: "Graphite", base: "dark", tokens: { bg: "#0b0c10", surface: "#15171d", surfaceInk: "#eceef3", muted: "#8e95a4", line: "#23262e", accent: "#eceef3", accentInk: "#0b0c10", planet: "#b9c7ff", note: ["#2a2a20", "#2c1f26", "#1c2430", "#1d2a22", "#241f33", "#2e241c"], gridSize: 32, gridOpacity: 0.03, radius: "m", shadow: "soft", motion: "normal" } },
  { id: "sage", name: "Sage", base: "light", tokens: { bg: "#c9d4c1", surface: "#f6f8f2", surfaceInk: "#2f3a2c", muted: "#5f6e59", line: "#dfe6d7", accent: "#5b7552", accentInk: "#ffffff", planet: "#e3efd6", note: ["#f3efc8", "#dfeed8", "#d6e8e1", "#e8f0d0", "#ebe6d8", "#f1e3cf"], gridSize: 28, gridOpacity: 0.04, radius: "m", shadow: "soft", motion: "normal" } },
  { id: "sunset", name: "Sunset", base: "dark", tokens: { bg: "#2a1a2e", surface: "#3a2440", surfaceInk: "#fbe9dc", muted: "#d7b4b4", line: "#4d3050", accent: "#ff8a5b", accentInk: "#2a1a2e", planet: "#ffb36b", note: ["#5a3346", "#5b3a2b", "#4a3b5c", "#5a4236", "#3f4d5c", "#5c3d52"], gridSize: 28, gridOpacity: 0.03, radius: "l", shadow: "strong", motion: "normal" } },
  { id: "ocean", name: "Ocean", base: "dark", tokens: { bg: "#0b2a3a", surface: "#113a4f", surfaceInk: "#e4f6fb", muted: "#9cc8d6", line: "#1a4a60", accent: "#5fd3e6", accentInk: "#06202b", planet: "#7fe0f0", note: ["#21495a", "#2a4f5e", "#1f4b4a", "#26576b", "#2c4a66", "#2e5a55"], gridSize: 36, gridOpacity: 0.04, radius: "m", shadow: "soft", motion: "normal" } },
  { id: "lavender", name: "Lavender night", base: "dark", tokens: { bg: "#231d3a", surface: "#2f2751", surfaceInk: "#efeaff", muted: "#b6aed9", line: "#3d3470", accent: "#c3b1ff", accentInk: "#231d3a", planet: "#e0b8ff", note: ["#3f3561", "#3a2f5a", "#33406a", "#4a3a6e", "#2f4a63", "#524275"], gridSize: 28, gridOpacity: 0.035, radius: "m", shadow: "soft", motion: "normal" } },
];

// Applies a theme. Ids: a built-in ("cork"...), an extra built-in ("sage"...), "custom:<id>", or "auto".
// "auto" picks light-minimal or dark-minimal from the phone's light/dark setting.
function applyTheme(id) {
  let want = String(id);
  if (want === "auto") want = matchMedia("(prefers-color-scheme: dark)").matches ? "graphite" : "light-minimal";
  const custom = want.startsWith("custom:") ? customById(want.slice(7)) : null;
  const extra = custom ? null : EXTRA_THEMES.find((t) => t.id === want) || null;
  clearPaint();
  let stored, metaColor;
  if (custom || extra) {
    // these start from the closest built-in CSS, then their saved colours are painted on top
    const src = custom || extra;
    document.documentElement.dataset.theme = src.base === "light" ? "cork" : "midnight";
    paintTheme(src.tokens, src.base);
    metaColor = src.tokens.bg || "#0e1014";
    stored = id === "auto" ? "auto" : String(id);
  } else {
    const resolved = ["cork", "pastel", "midnight", "dreamy"].includes(want) ? want : "midnight";
    document.documentElement.dataset.theme = resolved;
    metaColor = { cork: "#8a5e36", pastel: "#f5ecff", midnight: "#0e1014", dreamy: "#8d9cc4" }[resolved];
    stored = id === "auto" ? "auto" : resolved;
  }
  document.querySelector('meta[name="theme-color"]').content = metaColor;
  ls.set("soy-theme", stored);
}
// When the phone switches between light and dark, an "auto" theme follows it.
try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (ls.get("soy-theme", "midnight") === "auto") applyTheme("auto"); }); } catch { /* old browser: no auto switching */ }

// ---- Theme schema (Phase 1 groundwork for custom themes; see roadmap section 5.2) ----
const THEME_COLOR_KEYS = { bg: "--bg", surface: "--surface", surfaceInk: "--surface-ink", muted: "--muted", line: "--line", accent: "--accent", accentInk: "--accent-ink", danger: "--danger", planet: "--planet" };
const THEME_HEX = /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/;
function validateTheme(input) {
  const errors = [];
  if (!input || typeof input !== "object") return { ok: false, errors: ["Theme must be an object"] };
  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (name.length < 1 || name.length > 40) errors.push("Name must be 1 to 40 characters");
  const t = input.tokens;
  if (!t || typeof t !== "object") return { ok: false, errors: [...errors, "Missing tokens"] };
  const out = { name, base: input.base === "light" ? "light" : "dark", tokens: {} };
  for (const k of Object.keys(THEME_COLOR_KEYS)) {
    if (t[k] === undefined) continue;
    if (typeof t[k] !== "string" || !THEME_HEX.test(t[k])) errors.push(`${k} must be #rrggbb or #rrggbbaa`);
    else out.tokens[k] = t[k];
  }
  if (t.gridSize !== undefined) {
    if (typeof t.gridSize !== "number" || t.gridSize < 8 || t.gridSize > 64) errors.push("gridSize must be 8 to 64");
    else out.tokens.gridSize = t.gridSize;
  }
  if (t.gridOpacity !== undefined) {
    if (typeof t.gridOpacity !== "number" || t.gridOpacity < 0 || t.gridOpacity > 0.2) errors.push("gridOpacity must be 0 to 0.2");
    else out.tokens.gridOpacity = t.gridOpacity;
  }
  if (t.radius !== undefined) {
    if (!["s", "m", "l"].includes(t.radius)) errors.push("radius must be s, m or l");
    else out.tokens.radius = t.radius;
  }
  if (t.shadow !== undefined) {
    if (!["none", "soft", "strong"].includes(t.shadow)) errors.push("shadow must be none, soft or strong");
    else out.tokens.shadow = t.shadow;
  }
  if (t.motion !== undefined) {
    if (!["calm", "normal"].includes(t.motion)) errors.push("motion must be calm or normal");
    else out.tokens.motion = t.motion;
  }
  if (Array.isArray(t.note)) {
    if (t.note.length > 6 || t.note.some((c) => typeof c !== "string" || !THEME_HEX.test(c))) errors.push("note must be up to 6 hex colors");
    else out.tokens.note = t.note.slice();
  }
  for (const k of Object.keys(t)) if (!(k in THEME_COLOR_KEYS) && !["gridSize", "gridOpacity", "radius", "shadow", "motion", "note"].includes(k) && !["bgPattern", "gridColor"].includes(k)) errors.push(`Unknown token: ${k}`);
  return errors.length ? { ok: false, errors } : { ok: true, theme: out, errors: [] };
}
// ============ Custom themes (Phase 4, roadmap section 5.2) ============
// A custom theme is a validated theme object (see validateTheme). Each device keeps its list in
// localStorage, and "soy-theme" holds either a built-in id ("cork", ...) or "custom:<id>".
// Applying a theme = clear any old inline colours, then write the new ones as CSS variables on <html>.
const CUSTOM_KEY = "pinned.themes.custom";
const CUSTOM_MAX = 12;
const PAINT_KEYS = ["--bg", "--surface", "--surface-ink", "--muted", "--line", "--accent", "--accent-ink", "--planet",
  "--topbar", "--topbar-ink", "--note-ink", "--bg-image", "--bg-size", "--radius-m", "--note-shadow",
  "--n1", "--n2", "--n3", "--n4", "--n5", "--n6", "color-scheme"];

// Turns a theme's tokens into CSS variables. Used for the real page and for the builder preview.
function tokenVars(t) {
  const v = {};
  const set = (k, val) => { if (val !== undefined && val !== null) v[k] = val; };
  set("--bg", t.bg); set("--surface", t.surface); set("--surface-ink", t.surfaceInk); set("--muted", t.muted);
  set("--line", t.line); set("--accent", t.accent); set("--accent-ink", t.accentInk); set("--planet", t.planet);
  if (t.bg) set("--topbar", `color-mix(in srgb, ${t.bg} 82%, transparent)`);
  set("--topbar-ink", t.surfaceInk); set("--note-ink", t.surfaceInk);
  // grid: lines drawn in the text colour at the chosen strength; strength 0 means no grid
  const size = t.gridSize ?? 28, op = t.gridOpacity ?? 0;
  if (op > 0 && t.surfaceInk) {
    const g = `color-mix(in srgb, ${t.surfaceInk} ${(op * 100).toFixed(1)}%, transparent)`;
    v["--bg-image"] = `linear-gradient(${g} 1px, transparent 1px), linear-gradient(90deg, ${g} 1px, transparent 1px)`;
    v["--bg-size"] = `${size}px ${size}px, ${size}px ${size}px`;
  } else { v["--bg-image"] = "none"; v["--bg-size"] = "auto"; }
  v["--radius-m"] = { s: "10px", m: "16px", l: "22px" }[t.radius || "m"];
  v["--note-shadow"] = { none: "none", soft: "0 8px 18px -10px rgba(0,0,0,.45)", strong: "0 14px 30px -10px rgba(0,0,0,.7)" }[t.shadow || "soft"];
  (t.note || []).forEach((c, i) => { v[`--n${i + 1}`] = c; });
  return v;
}
function paintTheme(tokens, base) {
  const root = document.documentElement.style;
  for (const [k, val] of Object.entries(tokenVars(tokens))) root.setProperty(k, val);
  root.setProperty("color-scheme", base === "light" ? "light" : "dark");
}
function clearPaint() {
  const root = document.documentElement.style;
  for (const k of PAINT_KEYS) root.removeProperty(k);
}
function customThemes() { const v = ls.get(CUSTOM_KEY, []); return Array.isArray(v) ? v : []; }
function customById(id) { return customThemes().find((t) => t.id === id) || null; }
function saveCustomThemes(list) { ls.set(CUSTOM_KEY, list); }

// ---- Theme picker in Settings: built-ins, your custom themes, then "Build a theme" ----
function renderThemePicker() {
  const tp = $("#themePicker"); tp.innerHTML = "";
  const cur = document.documentElement.dataset.theme;
  const curId = ls.get("soy-theme", "midnight");
  const pick = (id, el) => {
    applyTheme(id);
    tp.querySelectorAll(".theme-card").forEach((x) => x.setAttribute("aria-pressed", String(x === el)));
    rebuildAllNotes();
  };
  for (const t of THEMES) {
    const b = document.createElement("button"); b.className = "theme-card"; b.type = "button";
    b.setAttribute("aria-pressed", String(t.id === curId));
    b.innerHTML = `<div class="sw" style="background:${t.bg}">${t.notes.map((c) => `<i style="background:${c}"></i>`).join("")}</div><b></b>`;
    b.querySelector("b").textContent = t.name;
    b.onclick = () => pick(t.id, b);
    tp.appendChild(b);
  }
  const autoCard = document.createElement("button"); autoCard.className = "theme-card"; autoCard.type = "button";
  autoCard.setAttribute("aria-pressed", String(curId === "auto"));
  autoCard.innerHTML = `<div class="sw auto-sw" aria-hidden="true"></div><b>Auto (day and night)</b>`;
  autoCard.onclick = () => pick("auto", autoCard);
  tp.appendChild(autoCard);
  for (const t of EXTRA_THEMES) {
    const b = document.createElement("button"); b.className = "theme-card"; b.type = "button";
    b.setAttribute("aria-pressed", String(t.id === curId));
    b.innerHTML = `<div class="sw" style="background:${t.tokens.bg}">${t.tokens.note.slice(0, 3).map((c) => `<i style="background:${c}"></i>`).join("")}</div><b></b>`;
    b.querySelector("b").textContent = t.name;
    b.onclick = () => pick(t.id, b);
    tp.appendChild(b);
  }
  for (const c of customThemes()) {
    const id = `custom:${c.id}`;
    const b = document.createElement("button"); b.className = "theme-card custom"; b.type = "button";
    b.setAttribute("aria-pressed", String(id === curId));
    b.innerHTML = `<div class="sw" style="background:${c.tokens.bg}">${(c.tokens.note || []).slice(0, 3).map((n) => `<i style="background:${n}"></i>`).join("")}</div><b></b><span class="tc-edit">Edit</span>`;
    b.querySelector("b").textContent = c.name;
    b.onclick = () => pick(id, b);
    b.querySelector(".tc-edit").onclick = (e) => { e.stopPropagation(); openThemeBuilder(c.id); };
    tp.appendChild(b);
  }
  const add = document.createElement("button"); add.className = "theme-card add"; add.type = "button";
  add.innerHTML = `<div class="sw plus" aria-hidden="true">+</div><b>Build a theme</b>`;
  add.onclick = () => openThemeBuilder(null);
  tp.appendChild(add);
}

// ---- Theme builder (roadmap 5.2.2): edit a working copy, preview live, save only when valid ----
// Starting points. Values match the built-in look so "Start from" feels familiar.
const TB_STARTS = {
  cork:     { label: "Cozy cork",   base: "light", tokens: { bg: "#b98a5a", surface: "#fffaf2", surfaceInk: "#3b2a1a", muted: "#7c6650", line: "#ead9c3", accent: "#c2410c", accentInk: "#ffffff", planet: "#ff9fd0", note: ["#fff176", "#ffb3c7", "#a7d8ff", "#b8f0b0", "#d7c2ff", "#ffcf99"], gridSize: 28, gridOpacity: 0, radius: "m", shadow: "soft", motion: "normal" } },
  pastel:   { label: "Pastel",      base: "light", tokens: { bg: "#f5ecff", surface: "#ffffff", surfaceInk: "#3f345a", muted: "#6f6391", line: "#ece4fa", accent: "#b86bd8", accentInk: "#ffffff", planet: "#ffd6e5", note: ["#fff4b8", "#ffd6e5", "#d4ecff", "#d7f7dc", "#e9dcff", "#ffe2c9"], gridSize: 28, gridOpacity: 0, radius: "m", shadow: "soft", motion: "normal" } },
  midnight: { label: "Dark minimal", base: "dark", tokens: { bg: "#0e1014", surface: "#171a21", surfaceInk: "#e7e9ee", muted: "#8a909e", line: "#262a33", accent: "#e7e9ee", accentInk: "#0e1014", planet: "#ffd0e6", note: ["#2b2a1f", "#2e1f27", "#1d2633", "#1e2b22", "#262033", "#30251c"], gridSize: 28, gridOpacity: 0.035, radius: "m", shadow: "soft", motion: "normal" } },
  dreamy:   { label: "Dreamy",      base: "light", tokens: { bg: "#6f7fa6", surface: "#f6f4ff", surfaceInk: "#34385a", muted: "#5d6287", line: "#7878aa33", accent: "#7c6fd6", accentInk: "#ffffff", planet: "#ffd0e6", note: ["#fff6c8", "#ffd2e2", "#c8e6ff", "#cdf5e1", "#e1d2ff", "#ffdec8"], gridSize: 28, gridOpacity: 0, radius: "m", shadow: "soft", motion: "normal" } },
  blank:    { label: "Blank dark",  base: "dark", tokens: { bg: "#111318", surface: "#1b1e26", surfaceInk: "#eceef3", muted: "#9aa1b2", line: "#2a2f3b", accent: "#eceef3", accentInk: "#111318", planet: "#ffd0e6", note: ["#2b2a1f", "#2e1f27", "#1d2633", "#1e2b22", "#262033", "#30251c"], gridSize: 28, gridOpacity: 0.03, radius: "m", shadow: "soft", motion: "normal" } },
};
const TB_COLOR_FIELDS = [
  ["bg", "Background"], ["surface", "Cards"], ["surfaceInk", "Text"], ["muted", "Secondary text"],
  ["line", "Dividers"], ["accent", "Buttons"], ["accentInk", "Button text"], ["planet", "Planet glow"],
];
let tb = null; // the working copy while the builder is open

const cloneTokens = (x) => JSON.parse(JSON.stringify(x));
// WCAG contrast ratio between two #rrggbb colours (1 = no contrast, 21 = black on white)
function luminance(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a.slice(0, 7)), luminance(b.slice(0, 7))].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function openThemeBuilder(id) {
  const existing = id ? customById(id) : null;
  if (!existing && customThemes().length >= CUSTOM_MAX) {
    toast(`You can keep up to ${CUSTOM_MAX} custom themes. Delete one first.`); return;
  }
  tb = existing
    ? { id: existing.id, name: existing.name, base: existing.base, tokens: cloneTokens(existing.tokens) }
    : { id: null, name: "", base: "dark", tokens: cloneTokens(TB_STARTS.midnight.tokens) };
  if (!tb.tokens.note) tb.tokens.note = [...TB_STARTS.midnight.tokens.note];
  $("#tbTitle").textContent = existing ? "Edit theme" : "Build a theme";
  $("#tbDelete").hidden = !existing;
  $("#tbError").hidden = true;
  $("#tbName").value = tb.name;
  renderTbStarts();
  renderTbControls();
  openSheet("themeBuilder");
}

function renderTbStarts() {
  const wrap = $("#tbStart"); wrap.innerHTML = "";
  for (const [key, st] of Object.entries(TB_STARTS)) {
    const b = document.createElement("button"); b.type = "button"; b.textContent = st.label;
    b.onclick = () => { tb.base = st.base; tb.tokens = cloneTokens(st.tokens); renderTbControls(); };
    wrap.appendChild(b);
  }
}

// Builds the colour rows once, then keeps their values in step with the working copy.
function buildTbControls() {
  const colors = $("#tbColors"); colors.innerHTML = "";
  for (const [key, label] of TB_COLOR_FIELDS) {
    const row = document.createElement("label"); row.className = "tb-row";
    row.innerHTML = `<span></span><input type="color" aria-label="${label}">`;
    row.querySelector("span").textContent = label;
    row.querySelector("input").oninput = (e) => { tb.tokens[key] = e.target.value; renderTbPreview(); renderTbContrast(); };
    row.querySelector("input").dataset.key = key;
    colors.appendChild(row);
  }
  const notes = $("#tbNotes"); notes.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    const inp = document.createElement("input"); inp.type = "color"; inp.setAttribute("aria-label", `Note colour ${i + 1}`);
    inp.oninput = (e) => { tb.tokens.note[i] = e.target.value; renderTbPreview(); };
    inp.dataset.note = String(i);
    notes.appendChild(inp);
  }
  $("#tbGridSize").oninput = (e) => { tb.tokens.gridSize = Number(e.target.value); renderTbControls(false); renderTbPreview(); };
  $("#tbGridOp").oninput = (e) => { tb.tokens.gridOpacity = Number(e.target.value); renderTbControls(false); renderTbPreview(); };
  $("#tbName").oninput = (e) => { tb.name = e.target.value; };
  document.querySelectorAll("#tbRadius button").forEach((b) => b.onclick = () => { tb.tokens.radius = b.dataset.v; renderTbControls(false); renderTbPreview(); });
}

// Puts the working copy into every control, then refreshes the preview and contrast checks.
function renderTbControls(all = true) {
  const t = tb.tokens;
  if (all) {
    document.querySelectorAll("#tbColors input[type=color]").forEach((inp) => { inp.value = t[inp.dataset.key] || "#000000"; });
    document.querySelectorAll("#tbNotes input[type=color]").forEach((inp) => { inp.value = (t.note || [])[Number(inp.dataset.note)] || "#000000"; });
  }
  $("#tbGridSize").value = t.gridSize ?? 28; $("#tbGridSizeV").textContent = `${t.gridSize ?? 28}px`;
  $("#tbGridOp").value = t.gridOpacity ?? 0; $("#tbGridOpV").textContent = (t.gridOpacity ?? 0) === 0 ? "off" : String(t.gridOpacity);
  document.querySelectorAll("#tbRadius button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === (t.radius || "m"))));
  renderTbPreview(); renderTbContrast();
}

// The mini board: the same CSS variables the real page uses, scoped to this box only.
function renderTbPreview() {
  const pv = $("#tbPreview");
  for (const [k, v] of Object.entries(tokenVars(tb.tokens))) pv.style.setProperty(k, v);
}

// Text pairs the app relies on most. Body text needs 4.5:1 (WCAG AA).
function renderTbContrast() {
  const t = tb.tokens;
  const pairs = [
    ["Text on cards", t.surfaceInk, t.surface],
    ["Secondary text on cards", t.muted, t.surface],
    ["Button text", t.accentInk, t.accent],
    ["Text on background", t.surfaceInk, t.bg],
  ];
  const box = $("#tbContrast"); box.innerHTML = "";
  let weak = 0;
  for (const [label, a, b] of pairs) {
    const r = contrastRatio(a, b), ok = r >= 4.5;
    if (!ok) weak++;
    const row = document.createElement("div"); row.className = `tb-check ${ok ? "ok" : "warn"}`;
    row.innerHTML = `<span></span><b>${r.toFixed(1)}:1</b>`;
    row.querySelector("span").textContent = `${ok ? "✓" : "!"} ${label}`;
    box.appendChild(row);
  }
  if (weak) { const n = document.createElement("p"); n.className = "hint"; n.textContent = "Some text may be hard to read. You can still save."; box.appendChild(n); }
}

function saveThemeFromBuilder() {
  const name = (tb.name || "").trim() || "My theme";
  const res = validateTheme({ name, base: tb.base, tokens: tb.tokens });
  if (!res.ok) { $("#tbError").textContent = res.errors[0]; $("#tbError").hidden = false; return; }
  const list = customThemes();
  const now = Date.now();
  if (tb.id) {
    const i = list.findIndex((t) => t.id === tb.id);
    if (i >= 0) list[i] = { id: tb.id, ...res.theme, updatedAt: now };
  } else {
    if (list.length >= CUSTOM_MAX) { $("#tbError").textContent = `You can keep up to ${CUSTOM_MAX} custom themes.`; $("#tbError").hidden = false; return; }
    tb.id = newThemeId();
    list.push({ id: tb.id, ...res.theme, updatedAt: now });
  }
  saveCustomThemes(list);
  applyTheme(`custom:${tb.id}`);
  closeSheet("themeBuilder");
  renderThemePicker();
  rebuildAllNotes();
  toast("Theme saved");
  syncThemes().catch(() => {});
}

function deleteThemeFromBuilder() {
  if (!tb.id) return;
  if (!confirm("Delete this theme? Boards using it go back to Cozy corkboard.")) return;
  addTombstone(tb.id);                     // so the deletion also reaches your other devices
  saveCustomThemes(customThemes().filter((t) => t.id !== tb.id));
  if (ls.get("soy-theme", "midnight") === `custom:${tb.id}`) applyTheme("midnight");
  closeSheet("themeBuilder");
  renderThemePicker();
  rebuildAllNotes();
  syncThemes().catch(() => {});
}

// ---- Phase 4b: ids, export, import, duplicate ----
// Theme ids are UUIDs, because the database column is a uuid type.
function newThemeId() {
  if (window.crypto?.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => { const r = (Math.random() * 16) | 0; return (c === "x" ? r : (r & 3) | 8).toString(16); });
}
const isUuid = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s));
const slug = (s) => (s || "theme").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "theme";

// File format: { app: "pinned", kind: "themes", version: 1, themes: [{ name, base, tokens }] }.
// Only the look is exported. Ids and times are made fresh on import.
function exportThemes(list) {
  if (!list.length) return toast("No custom themes to export yet");
  const doc = { app: "pinned", kind: "themes", version: 1, exportedAt: new Date().toISOString(),
    themes: list.map((t) => ({ name: t.name, base: t.base, tokens: t.tokens })) };
  const url = URL.createObjectURL(new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url; a.download = list.length === 1 ? `${slug(list[0].name)}.theme.json` : "pinned-themes.json";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(`Exported ${list.length} theme${list.length === 1 ? "" : "s"}`);
}

// Every theme in the file goes through validateTheme. Bad ones are skipped and listed in the console.
async function importThemesFile(file) {
  if (!file) return;
  if (file.size > 200 * 1024) return toast("That file is too big to be a theme file");
  let data;
  try { data = JSON.parse(await file.text()); } catch { return toast("That file isn't valid JSON"); }
  const raw = Array.isArray(data?.themes) ? data.themes : (data && data.tokens ? [data] : []);
  if (!raw.length) return toast("No themes found in that file");
  const list = customThemes();
  const names = new Set(list.map((t) => t.name));
  let added = 0; const skipped = [];
  for (const item of raw) {
    const res = validateTheme({ name: item?.name, base: item?.base, tokens: item?.tokens });
    if (!res.ok) { skipped.push(`${item?.name || "Unnamed"}: ${res.errors[0]}`); continue; }
    if (list.length >= CUSTOM_MAX) { skipped.push(`${res.theme.name}: you already have ${CUSTOM_MAX} themes`); continue; }
    const base0 = res.theme.name.slice(0, 34); let name = base0, n = 2;
    while (names.has(name)) name = `${base0} (${n++})`;
    names.add(name);
    list.push({ id: newThemeId(), name, base: res.theme.base, tokens: res.theme.tokens, updatedAt: Date.now() });
    added++;
  }
  saveCustomThemes(list);
  renderThemePicker();
  if (skipped.length) console.warn("Theme import skipped:", skipped);
  toast(added ? `Imported ${added} theme${added === 1 ? "" : "s"}${skipped.length ? `. Skipped ${skipped.length}` : ""}` : "Nothing imported. Check the file");
  if (added) syncThemes().catch(() => {});
}

// Copies the theme open in the builder as a new theme, named "<name> copy".
function duplicateThemeFromBuilder() {
  if (customThemes().length >= CUSTOM_MAX) return toast(`You can keep up to ${CUSTOM_MAX} custom themes. Delete one first.`);
  const res = validateTheme({ name: ((tb.name || "").trim() || "My theme").slice(0, 34) + " copy", base: tb.base, tokens: tb.tokens });
  if (!res.ok) { $("#tbError").textContent = res.errors[0]; $("#tbError").hidden = false; return; }
  const list = customThemes();
  list.push({ id: newThemeId(), ...res.theme, updatedAt: Date.now() });
  saveCustomThemes(list);
  closeSheet("themeBuilder");
  renderThemePicker();
  toast("Copied. It's in your themes now");
  syncThemes().catch(() => {});
}

// ---- Phase 4c: sync with Supabase (user_themes). This device is the cache; the server is shared.
// Rule: for each id, the copy with the newer updatedAt wins. Deletions are kept in a list until the server confirms them.
const TOMB_KEY = "pinned.themes.deleted";
function addTombstone(id) { const l = ls.get(TOMB_KEY, []); if (!l.includes(id)) l.push(id); ls.set(TOMB_KEY, l); }

// Themes made before this release used short ids ("c..."). The database needs UUIDs, so they get new ones.
function migrateThemeIds() {
  let changed = false;
  const list = customThemes().map((t) => {
    if (isUuid(t.id)) return t;
    changed = true;
    const newId = newThemeId();
    if (ls.get("soy-theme", "midnight") === `custom:${t.id}`) ls.set("soy-theme", `custom:${newId}`);
    return { ...t, id: newId };
  });
  if (changed) saveCustomThemes(list);
}

let themeSyncRun = null;
async function syncThemes() {
  const status = $("#themeSync");
  const say = (m) => { if (status) status.textContent = m; };
  if (isDemo) return say("Saved on this device.");
  if (!api.hasSession()) return say("Sign in to sync themes across your devices.");
  if (themeSyncRun) return themeSyncRun;   // only one sync at a time
  themeSyncRun = (async () => {
    try {
      say("Syncing…");
      migrateThemeIds();
      const dead = ls.get(TOMB_KEY, []);
      for (const id of dead) if (isUuid(id)) await api.deleteTheme(id);
      ls.set(TOMB_KEY, []);
      const remote = await api.listThemes();
      const byId = new Map(customThemes().filter((t) => !dead.includes(t.id)).map((t) => [t.id, t]));
      const remoteAt = new Map();
      for (const r of remote) {
        if (dead.includes(r.id)) continue;
        const at = new Date(r.updated_at).getTime() || 0;
        remoteAt.set(r.id, at);
        const check = validateTheme({ name: r.name, base: r.json?.base, tokens: r.json?.tokens });
        if (!check.ok) continue;
        const local = byId.get(r.id);
        if (!local || at > (local.updatedAt || 0) + 1000) byId.set(r.id, { id: r.id, ...check.theme, updatedAt: at });
      }
      const merged = [...byId.values()].slice(0, CUSTOM_MAX);
      for (const t of merged) {
        const at = remoteAt.get(t.id);
        if (at === undefined || (t.updatedAt || 0) > at + 1000) await api.upsertTheme(t);
      }
      const before = JSON.stringify(customThemes());
      saveCustomThemes(merged);
      if (JSON.stringify(merged) !== before) {
        renderThemePicker();
        applyTheme(ls.get("soy-theme", "midnight"));
        rebuildAllNotes();
      }
      say(`Synced at ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
    } catch (e) {
      console.warn("Theme sync failed", e);
      say("Couldn't sync right now. Your themes are saved on this device.");
    } finally { themeSyncRun = null; }
  })();
  return themeSyncRun;
}

// ---- Phase 4e: Feel switches (Calm motion, Decorations) ----
function renderFeelSwitches() {
  $("#calmSwitch").setAttribute("aria-checked", String(ls.get("pinned-calm", false) === true));
  $("#decoSwitch").setAttribute("aria-checked", String(ls.get("pinned-deco", true) !== false));
}

// ---- Update log and credits (Settings, About) ----
// RULE: every release adds one entry at the TOP of UPDATE_LOG. Its `v` must match APP_VERSION and the sw.js CACHE name.
const UPDATE_LOG = [
  { v: "soy-v77", date: "2026-10-23", title: "Roster and chat on the left", items: ["Roster and chat panels sit on the left so the aisle and floor stay visible"] },
  { v: "soy-v76", date: "2026-10-23", title: "Church: who is here, and chat", items: [
    "A dock under the church shows who is online, with a green dot for each person",
    "Tap \"Who is here\" for the roster: name, where they are sitting, and a green Online dot",
    "Tap \"Chat\" for a church chat with the member count and unread badge; Escape closes it",
    "People only see others in the same room; chat is shared only while you are in the church",
    "Censing deacon now walks in front of the lectern, with the censer sound timed to each swing",
    "Aisle is a solid red carpet with a woven texture"
  ] },
  { v: "soy-v70", date: "2026-10-23", title: "Church: enclosed, calmer, with a censing deacon", items: [
    "Stone walls, a dark vault and shadowed floor, so the church feels closed in",
    "Lectern moved to the centre of the nave",
    "A deacon walks slowly down the aisle and back, swinging a censer with rising incense",
    "The censer chain clinks as it swings (plays with the music)",
    "Music: three original pieces, each with a solo melody over the choir, and slower chord changes"] },
  { v: "soy-v69", date: "2026-10-23", title: "Church: more detailed", items: ["Gold apse with the Theotokos in prayer, painted vault with angels, and chandeliers", "Three-tier iconostasis with icon rows and arched royal doors, plus candle stands", "Marble columns, frescoed side walls and stained-glass windows", "Depth: the walls and the nave move slightly as you move your pointer or finger", "Original artwork, inspired by Orthodox church interiors. No photos are used"] },
  { v: "soy-v68", date: "2026-10-23", title: "Church fills the desktop screen", items: ["The church uses the full width on desktop instead of a narrow strip"] },
  { v: "soy-v67", date: "2026-10-23", title: "Church: larger, Bible at the top, choir music", items: ["Church fills more of the screen", "Bible button at the top centre, and in the church toolbar", "Choir music: soft, slow hymn chords that fade in and out. Three tracks (Vespers, Liturgy, Dawn), with a volume slider", "Music starts when you enter and stops when you leave. The 🔊 mute also silences it", "Music is generated in the browser, not recorded"] },
  { v: "soy-v66", date: "2026-10-23", title: "Undo and redo in the top bar, dark by default", items: ["Undo and redo sit in the top bar on every board", "New devices start with the dark theme (Dark minimal). Pick Cozy cork in Settings to go back"] },
  { v: "soy-v65", date: "2026-10-23", title: "Simpler board", items: ["One 🎉 button opens the fun tools above it, instead of a strip across the board", "Right-hand side keeps only the + button", "Find, home, drawing, live location, Church and Games live in More", "Undo and redo show only while drawing", "Dark, frosted controls on every board"] },
  { v: "soy-v64", date: "2026-10-23", title: "Church", items: ["Church button in the board sidebar (right-hand side). Rooms you make or join are the way in", "A shared Orthodox church: everyone in it can see each other, sitting in pews or standing at the back", "Door sounds when you enter and leave, and quiet ones when others do. The 🔊 button mutes them", "Back to my room returns you to the board you came from", "Bible at the lectern: search by reference or word, browse books and chapters, change text size", "Translations: English (King James, American Standard, World English, Darby, Young's Literal) and Russian Synodal (64 of 66 books)"] },
  { v: "soy-v59", date: "2026-10-22", title: "Parry Brawl: items and fists", items: ["Items fall every 18 to 28 seconds: swords in three sizes, bombs and gloves", "Throw (middle click or V) picks items up, and throws them when you hold one", "Hold Down and throw to drop an item at your feet", "Dropped and thrown items burn up 4 seconds later unless picked up", "Fighters start with fists and show their own detail"] },
  { v: "soy-v58", date: "2026-10-22", title: "Parry Brawl: controls and roster", items: ["Fighter select: ten fighters, each with their own look, weapon, taunts and quirk", "Two control schemes in Settings > Controls: Keyboard & Mouse, or Keyboard A", "Dodge (Left Shift or Z), four taunts (1 2 3 4) with speech bubbles, hold Tab or B to show names", "Pause with Esc or Enter; Q quits to the menu"] },
  { v: "soy-v57", date: "2026-10-22", title: "Parry Brawl fixes", items: ["Menu buttons shrink long labels so Multiplayer (coming soon) fits", "Menu background is darker so the fighters no longer show through"] },
  { v: "soy-v56", date: "2026-10-22", title: "Parry Brawl menu", items: ["Main menu: Play, Multiplayer (coming soon), Settings, How to play", "Settings: music, sound effects, narrator and sound on or off, saved on this device", "How to play lists the moves and buttons", "Esc returns to the menu during a match"] },
  { v: "soy-v55", date: "2026-10-22", title: "Parry Brawl upgrade", items: ["More detailed fighters with a topknot, headband, scarf, hakama and sword", "Generated Japanese-style techno music", "Spoken narrator welcome on the title screen (press N to replay)", "Mouse controls: left click slashes, right click heavy, aim above for an upward smash"] },
  { v: "soy-v54", date: "2026-10-22", title: "Parry Brawl", items: ["New game: Parry Brawl, a platform fighter against the CPU with parries", "Parry the CPU's attacks to stun it and get a punish window"] },
  { v: "soy-v53", date: "2026-10-22", title: "Callout shapes", items: ["Speech bubble, oval speech bubble and thought bubble on the board shapes gallery"] },
  { v: "soy-v52", date: "2026-10-22", title: "Shapes and brush size", items: ["Shapes gallery on the board: line, arrow, rectangle, rounded rectangle, oval, triangle, right triangle, diamond, pentagon, hexagon, star and heart", "Drag out a shape; it saves like a pen line, so undo and erase work", "Brush size is now a slider on the board (1 to 24)"] },
  { v: "soy-v51", date: "2026-10-22", title: "Moderation and the Pinned name", items: ["Moderators (set in the database) can review reported feedback, hide or restore posts, and dismiss reports", "Hidden posts show a notice instead of their text, and are left out of exports", "One report per person per post", "App renamed to Pinned in the setup guide and notifications"] },
  { v: "soy-v50", date: "2026-10-22", title: "Feedback cycle, replies and email change", items: ["Feedback cycle in Messages: one shared space for everyone across all rooms, with threads and replies", "Post feedback as yourself or anonymously. Anonymous hides your name from other users", "Reply to chat messages, with the original quoted", "Report a post, or delete your own", "Export feedback as a CSV from the Feedback cycle screen", "Change your sign-in email from Account"] },
  { v: "soy-v63", date: "2026-10-23", title: "Fun tools", items: ["Fun tools on the board: party popper, explosion and emoji burst. Pick one, then tap the board. Everyone in the room sees it", "Celebrations: a party popper when you join a room, a sparkle with a happy chord when a room is locked, and an explosion on the map when a room is deleted", "Sound is on by default. The 🔊 button turns it off"] },
  { v: "soy-v60", date: "2026-10-23", title: "Every room is on the map", items: ["Your first screen is the room map, even before you have a room", "The app admin can delete any room from the map or from inside it", "The room owner can hide a room from the map. People inside still see it", "Anyone in a room can take admin from room settings. Admin moves to whoever presses it", "Joining with a code now allows up to 10 people, the same as the map", "Rooms you are not in are shown too. Tap an open room to join it straight away", "Locked rooms show a lock and can't be joined", "The room count shows on each room you can look at"] },
  { v: "soy-v49", date: "2026-10-22", title: "Rooms get names, photos and locks", items: ["Rename your room and add a room photo. Both show on the room list and at the top of the board, and update live", "Lock a room to stop new people joining with the code. Existing members are never locked out", "Room cards show the lock and the room code"] },
  { v: "soy-v48", date: "2026-10-22", title: "Scores tab", items: ["Scores tab in Games: each game's best run per person, with a podium for the top three", "Game scores are saved to the board and update every 15 seconds", "Quick Draw now reports its score too"] },
  { v: "soy-v47", date: "2026-10-22", title: "Games are back", items: ["Games button in the bottom bar, with 11 single-player games", "Bottom bar is centred; the + button moved into the right-hand tools column"] },
  { v: "soy-v46", date: "2026-10-21", title: "Fresh start", items: ["A clean start: no games"] },
];
const CREDITS = [
  ["Made by", "Himal (9bitbin)"],
  ["Backend", "Supabase (database, login, storage, realtime)"],
  ["Hosting", "GitHub Pages"],
  ["Supabase JS client", "@supabase/supabase-js, MIT licence"],
];
function renderAbout() {
  if (UPDATE_LOG[0].v !== APP_VERSION) console.warn("UPDATE_LOG's top entry does not match APP_VERSION");
  const log = $("#updateLog"); log.textContent = "";
  UPDATE_LOG.forEach((r, i) => {
    const d = document.createElement("details"); d.open = i === 0;
    const s = document.createElement("summary");
    s.textContent = r.v === "earlier" ? r.title : `${r.v}${r.date ? " · " + r.date : ""} · ${r.title}`;
    const ul = document.createElement("ul");
    for (const it of r.items) { const li = document.createElement("li"); li.textContent = it; ul.appendChild(li); }
    d.append(s, ul); log.appendChild(d);
  });
  const cl = $("#creditsList"); cl.textContent = "";
  for (const [k, v] of CREDITS) { const li = document.createElement("li"); const b = document.createElement("b"); b.textContent = k + ": "; li.append(b, v); cl.appendChild(li); }
}

function memberById(id) { return state.members.find((m) => m.id === id); }
function others() { return state.members.filter((m) => m.id !== state.me?.id); }
function partner() { return others()[0]; }
function ownerName() { return memberById(state.board?.created_by)?.name || "the board's owner"; }
const listNames = (arr) => arr.length <= 2 ? arr.join(" and ") : `${arr.slice(0, -1).join(", ")} and ${arr[arr.length - 1]}`;
function nameOf(id) { return id === state.me?.id ? "you" : (memberById(id)?.name || "someone"); }
function timeAgo(iso) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (s < 45) return "just now";
  if (s < 3600) return rtf.format(-Math.round(s / 60), "minute");
  if (s < 86400) return rtf.format(-Math.round(s / 3600), "hour");
  return rtf.format(-Math.round(s / 86400), "day");
}

// floating emoji burst
function rain(emoji, count = 12) {
  if (prefersReducedMotion()) return;
  const fx = $("#fx");
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.textContent = emoji;
    s.style.left = Math.random() * 92 + "%";
    s.style.animationDelay = Math.random() * 0.6 + "s";
    s.style.fontSize = 24 + Math.random() * 22 + "px";
    s.style.setProperty("--r", (Math.random() * 60 - 30) + "deg");
    fx.appendChild(s);
    setTimeout(() => s.remove(), 3600);
  }
}

// ================================================================ Batch B: connection, outbox, undo/redo
let outbox = ls.get("pinned-outbox", []) || [];
let flushing = false, realtimeDown = false, connHideT = 0;
const saveOutbox = () => ls.set("pinned-outbox", outbox);

function setConn(state_) {
  // state_: "online" | "offline" | "reconnecting"
  const banner = $("#connBanner"), txt = $("#connText");
  if (!banner) return;
  clearTimeout(connHideT);
  if (state_ === "offline") { txt.textContent = outbox.length ? `Offline — ${outbox.length} waiting to send` : "You're offline"; banner.hidden = false; }
  else if (state_ === "reconnecting") { txt.textContent = "Reconnecting…"; banner.hidden = false; }
  else { // online
    if (outbox.length) { txt.textContent = "Back online — sending…"; banner.hidden = false; }
    else connHideT = setTimeout(() => (banner.hidden = true), 1200);
  }
}
function updateConn() {
  if (!state.board) return;
  if (!navigator.onLine) setConn("offline");
  else if (realtimeDown) setConn("reconnecting");
  else setConn("online");
}

// Try to send everything queued while offline, in order. Stops on the first network failure.
async function flushOutbox() {
  if (flushing || !outbox.length || !state.board || !navigator.onLine) return;
  flushing = true;
  try {
    while (navigator.onLine) {
      const item = outbox.find((it) => it.row.board_id === state.board.id);   // only this board's queue
      if (!item) break;
      try {
        if (item.kind === "note") {
          const saved = await api.addNote(item.row);
          removeNoteEl(item.tempId);
          state.notes.delete(item.tempId);
          await upsertNote(saved);
          api.notify(state.board.id, "note", { note_id: saved.id });
        } else if (item.kind === "msg") {
          const saved = await api.sendMessage(item.row);
          state.msgs = state.msgs.filter((x) => x.id !== item.tempId);
          onMessageEvent(saved);
          api.notify(state.board.id, "message", item.row.to_id ? { to: item.row.to_id } : {});
        }
        outbox = outbox.filter((x) => x !== item); saveOutbox();
      } catch (e) {
        if (isNetworkError(e)) break;          // still offline — leave it queued
        outbox = outbox.filter((x) => x !== item); saveOutbox();   // a real rejection (bad data): drop it so it can't wedge the queue
        toast("One queued item couldn't be sent and was dropped");
      }
    }
  } finally { flushing = false; updateConn(); renderPendingCount(); if (!outbox.length && navigator.onLine) setConn("online"); }
}
function queueNote(row, tempId) { outbox.push({ kind: "note", row, tempId, at: Date.now() }); saveOutbox(); renderPendingCount(); }
function queueMsg(row, tempId) { outbox.push({ kind: "msg", row, tempId, at: Date.now() }); saveOutbox(); renderPendingCount(); }
function renderPendingCount() { if (!$("#connBanner").hidden) updateConn(); }

// ---- undo / redo (session-local, best-effort on a shared board) ----
const hist = { undo: [], redo: [] };
function pushHist(action) { hist.undo.push(action); if (hist.undo.length > 40) hist.undo.shift(); hist.redo.length = 0; renderHistBar(); }
function renderHistBar() {
  const bar = $("#histBar"); if (!bar) return;
  const any = hist.undo.length || hist.redo.length;
  bar.hidden = !state.board;
  $("#histUndo").disabled = !hist.undo.length;
  $("#histRedo").disabled = !hist.redo.length;
}
async function doUndo() {
  const a = hist.undo.pop(); if (!a) return;
  renderHistBar();
  try { await a.undo(); hist.redo.push(a); haptic(10); toast(`Undid: ${a.label}`, 1800); }
  catch (e) { toast("Couldn't undo that"); }
  renderHistBar();
}
async function doRedo() {
  const a = hist.redo.pop(); if (!a) return;
  renderHistBar();
  try { await a.redo(); hist.undo.push(a); haptic(10); toast(`Redid: ${a.label}`, 1800); }
  catch (e) { toast("Couldn't redo that"); }
  renderHistBar();
}

// realtime connection status, with backoff resubscribe
let reconnectT = 0, reconnectTries = 0;
function onConnStatus(status) {
  if (status === "SUBSCRIBED") { realtimeDown = false; reconnectTries = 0; clearTimeout(reconnectT); updateConn(); flushOutbox(); }
  else if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status)) { realtimeDown = true; updateConn(); scheduleResub(); }
}
function scheduleResub() {
  clearTimeout(reconnectT);
  if (!navigator.onLine || !state.board) return;
  const delay = Math.min(30000, 1500 * Math.pow(2, reconnectTries++));
  reconnectT = setTimeout(() => { if (state.board && navigator.onLine) { api.subscribe(state.board.id, boardHandlers()); refreshReads(); } }, delay);
}

// ================================================================ boot
async function boot() {
  hapticsOn = ls.get("pinned-haptics", true);
  applyTheme(ls.get("soy-theme", "midnight"));
  handleJoinLink();
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch((e) => console.warn("SW failed", e));
  }
  let init = {};
  try { init = (await api.init()) || {}; } catch (e) { toast("Couldn't reach the server. Check your connection."); console.error(e); }
  $("#demoBanner").hidden = !isDemo;
  // Feel options (Phase 4e): saved on this device only
  document.documentElement.classList.toggle("calm", ls.get("pinned-calm", false) === true);
  document.documentElement.classList.toggle("no-deco", ls.get("pinned-deco", true) === false);
  if (api.hasSession()) setTimeout(() => syncThemes().catch(() => {}), 800);
  wireStatic();
  // /pinned/?games opens straight to the Games screen (the Back bar in each game links here)
  if (new URLSearchParams(location.search).has("games")) { history.replaceState(null, "", location.pathname); openGames(); }
  if (init.landing === "linked") return show("#linked");
  if (!api.hasSession()) return showLogin(init.linkError);
  await afterLogin();
}

async function afterLogin() {
  try {
    state.me = await api.me();
    if (!state.me) return showWelcome();
    state.me.muted = state.me.muted || [];
    await showMenu();
  } catch (e) {
    console.error(e); toast(e.message || "Something went wrong");
    showWelcome();
  }
}

// ---------------------------------------------------------------- email login
let pollTimer = null;
const PENDING = "soy-login-pending";
function newNonce() {
  const b = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}
function showLogin(err) {
  show("#login");
  const p = ls.get(PENDING);
  if (p && Date.now() - p.ts < 15 * 60 * 1000) showWaiting(p);
  else { ls.set(PENDING, null); $("#loginForm").hidden = false; $("#loginWait").hidden = true; }
  if (err) setError($("#loginError"), /expired|invalid/i.test(err) ? "That link expired or was already used. Send a new one." : err);
}
function showWaiting(p) {
  $("#loginForm").hidden = true; $("#loginWait").hidden = false;
  $("#waitEmail").textContent = p.email;
  startPolling(p.nonce);
}
async function onSendLink(again = false) {
  const email = (again ? (ls.get(PENDING) || {}).email : $("#emailInput").value || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError($("#loginError"), "That email doesn't look right.");
  setError($("#loginError"));
  const btn = again ? $("#resendLink") : $("#sendLink"); busy(btn, true, "Sending…");
  try {
    const p = { email, nonce: newNonce(), ts: Date.now() };
    await api.sendLink(email, p.nonce);
    ls.set(PENDING, p);
    showWaiting(p);
    if (again) toast("Sent a new link. Use the newest email.");
  } catch (e) { setError($("#loginError"), e.message); }
  busy(btn, false);
}
function startPolling(nonce) {
  clearInterval(pollTimer);
  const tick = async () => {
    try {
      if (await api.claimHandoff(nonce)) {
        clearInterval(pollTimer); pollTimer = null; ls.set(PENDING, null);
        toast("Signed in");
        await afterLogin();
      }
    } catch (e) { setError($("#loginError"), e.message); }
  };
  pollTimer = setInterval(tick, 3000);
  tick();
}

// ---------------------------------------------------------------- your rooms (menu)
// Every room you're in is listed here, most recently opened first. Hiding a room only hides it
// on this device. Nothing is left or deleted, and entering the code again brings it back.
const ROOMS_KEY = "pinned.rooms";
const roomsState = { list: [], edit: false, busy: false };
function roomsStore() { const v = ls.get(ROOMS_KEY, null) || {}; return { hidden: Array.isArray(v.hidden) ? v.hidden : [], opened: v.opened || {}, seen: Array.isArray(v.seen) ? v.seen : null }; }
function roomsSave(v) { ls.set(ROOMS_KEY, v); }
function markRoomOpened(boardId) {
  const v = roomsStore(); v.opened[boardId] = Date.now();
  v.hidden = v.hidden.filter((id) => id !== boardId);   // opening or joining a room always shows it again
  roomsSave(v);
}
async function loadRooms() {
  const rows = await api.myBoards();
  let dir = [];
  try { dir = (await api.listRooms()).filter((d) => !rows.some((r) => r.id === d.id)); } catch { /* the room directory is optional */ }
  const v = roomsStore();
  const photos = [...rows, ...dir].map((r) => r.photo_path).filter((p) => p && !state.urls[p]);
  if (photos.length) { try { Object.assign(state.urls, await api.mediaUrls(photos)); } catch { /* photos are optional */ } }
  const people = await Promise.all(rows.map((r) => api.roomPeople(r.id).catch(() => [])));
  const list = rows.map((r, i) => ({ ...r, member: true, people: people[i], last: v.opened[r.id] || Date.parse(r.joined_at) || 0 }));
  list.sort((a, b) => b.last - a.last);
  for (const d of dir) list.push({ ...d, member: false, people: [], last: 0 });
  return list;
}
async function showMenu() {
  show("#menu");
  $("#menu").classList.toggle("editing", roomsState.edit);
  startStars();
  try { roomsState.list = await loadRooms(); }
  catch (e) { toast(e.message || "Couldn't load the rooms"); roomsState.list = roomsState.list || []; }
  if (pendingJoinCode) return showPair();   // opened from an invite link: go straight to the code
  renderRooms();
  if (menuMusicOn) menuMusicStart();   // starts on the first tap if the browser needs one
}
// Solar-system menu. The sun sits in the middle. Each board has its own orbit, and new orbits open
// further out in the order you joined. Planets go round at their own speed (inner ones faster).
// Drag the empty space to look around; tap the sun to re-centre.
const ORBIT_START = 96, ORBIT_GAP = 72;      // radius of the first orbit and the space between orbits (px)
const ORBIT_GOLDEN = 2.39996;                // golden angle between planets, so they never line up
let orbitRaf = 0, panX = 0, panY = 0, panDrag = null;
const ORBIT_SQUASH = 0.55;                   // tilts the whole system so the orbits read as ellipses
function orbitLayout(list) {
  const byAge = [...list].sort((x, y) => (Date.parse(x.joined_at) || 0) - (Date.parse(y.joined_at) || 0));
  const rank = new Map(byAge.map((r, i) => [r.id, i]));
  return (r) => {
    const k = rank.get(r.id) ?? 0, a = ORBIT_START + k * ORBIT_GAP;
    const e = 0.06 + (k % 4) * 0.035;                                  // how stretched each orbit is
    return { a, e, b: a * Math.sqrt(1 - e * e), a0: k * ORBIT_GOLDEN,
      period: Math.min(160, Math.max(40, 40 * Math.pow(a / ORBIT_START, 1.5))) };   // Kepler: outer orbits take longer
  };
}
function keplerE(M, e) {                     // solve Kepler's equation, so speed changes along the orbit
  let E = M;
  for (let i = 0; i < 6; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return E;
}
function setPan(x, y) {
  panX = x; panY = y;
  const g = $("#roomGrid");
  if (g) { g.style.setProperty("--px", `${panX}px`); g.style.setProperty("--py", `${panY}px`); }
}
function initOrbitPan(grid) {
  if (grid._panReady) return;
  grid._panReady = true;
  grid.addEventListener("pointerdown", (e) => {
    if (roomsState.edit || e.target.closest(".room, .orbit-sun")) return;
    panDrag = { id: e.pointerId, x: e.clientX, y: e.clientY, px: panX, py: panY };
    try { grid.setPointerCapture(e.pointerId); } catch {}
  });
  grid.addEventListener("pointermove", (e) => {
    if (!panDrag || e.pointerId !== panDrag.id) return;
    setPan(panDrag.px + e.clientX - panDrag.x, panDrag.py + e.clientY - panDrag.y);
  });
  const end = (e) => { if (panDrag && e.pointerId === panDrag.id) panDrag = null; };
  grid.addEventListener("pointerup", end);
  grid.addEventListener("pointercancel", end);
}
function placeOrbits(now) {
  const grid = $("#roomGrid"); if (!grid) return;
  const t = now / 1000;
  for (const card of grid.querySelectorAll(".room")) {
    const o = card._orbit; if (!o) continue;
    const E = keplerE(o.a0 + (t / o.period) * Math.PI * 2, o.e);
    const x = o.a * (Math.cos(E) - o.e), y = o.b * Math.sin(E) * ORBIT_SQUASH;   // the sun is at the focus
    card.style.left = `calc(50% + var(--px, 0px) + ${x.toFixed(1)}px)`;
    card.style.top = `calc(50% + var(--py, 0px) + ${y.toFixed(1)}px)`;
  }
}
function moveOrbits(now) {
  if (!$("#roomGrid") || $("#menu").hidden) { orbitRaf = 0; return; }   // stop while the menu is closed
  placeOrbits(now);
  orbitRaf = requestAnimationFrame(moveOrbits);
}
function startOrbits() {
  if (prefersReducedMotion()) { placeOrbits(performance.now()); return; }   // static, but still in place
  if (!orbitRaf) orbitRaf = requestAnimationFrame(moveOrbits);
}
function renderRooms() {
  const v = roomsStore(), grid = $("#roomGrid");
  const visible = roomsState.list.filter((r) => !v.hidden.includes(r.id));
  const hidden = roomsState.list.filter((r) => v.hidden.includes(r.id));
  const firstRun = !v.seen;                       // first visit: nothing "arrives", everything just appears
  const seen = new Set(v.seen || []);
  grid.innerHTML = "";
  grid.classList.add("orbit-map");
  initOrbitPan(grid);
  const sun = document.createElement("button"); sun.type = "button"; sun.className = "orbit-sun";
  sun.setAttribute("aria-label", "Re-centre the map"); sun.onclick = () => setPan(0, 0);
  grid.appendChild(sun);
  const layout = orbitLayout(visible);
  for (const r of visible) {
    const o = layout(r), ring = document.createElement("span");
    ring.className = "orbit-ring" + (!firstRun && !seen.has(r.id) ? " arrive" : "");
    ring.setAttribute("aria-hidden", "true");
    ring.style.width = `${o.a * 2}px`; ring.style.height = `${o.b * 2 * ORBIT_SQUASH}px`;
    ring.style.left = `calc(50% + var(--px, 0px) + ${(-o.a * o.e).toFixed(1)}px)`;   // centre of the ellipse sits off the sun
    grid.appendChild(ring);
  }
  visible.forEach((r, i) => {
    const card = roomCard(r, i);
    card._orbit = layout(r);
    if (!firstRun && !seen.has(r.id)) card.classList.add("arrive");
    grid.appendChild(card);
  });
  setPan(panX, panY);
  placeOrbits(performance.now());
  roomsSave({ ...v, seen: roomsState.list.map((r) => r.id) });
  $("#menuHint").textContent = roomsState.edit
    ? "Tap × to hide a board. Nothing is deleted."
    : visible.length ? "Drag to look around. Tap a planet to jump in." : roomsState.list.length ? "Every board is hidden. Show one below." : "No rooms yet. Start one with the button below.";
  $("#hiddenTray").hidden = !hidden.length;
  const list = $("#hiddenList"); list.innerHTML = "";
  for (const r of hidden) {
    const b = document.createElement("button"); b.type = "button"; b.className = "chip-btn";
    b.textContent = `Show ${roomTitle(r)}`; b.onclick = () => showRoom(r.id); list.appendChild(b);
  }
  $("#menuEdit").setAttribute("aria-pressed", String(roomsState.edit));
  $("#menu").classList.toggle("editing", roomsState.edit);
  startOrbits();
}
function roomTitle(r) {
  if (r.name) return r.name;
  const names = (r.people || []).map((p) => p.name).filter(Boolean);
  if (names.length) return names.join(" & ");
  return r.member ? "Waiting for your person" : "Unnamed room";
}
function roomCard(r, i) {
  const c = document.createElement("button");
  c.dataset.id = r.id;
  c.type = "button"; c.className = "room" + (r.locked ? " locked" : "") + (r.member ? "" : " outside");
  c.style.animationDelay = `${(-(i * 0.7) % 6.5).toFixed(2)}s`;
  const color = BRIGHT[(r.people || [])[0]?.color] || BRIGHT[["c1", "c2", "c3", "c4", "c5", "c6"][i % 6]];
  c.style.setProperty("--planet", color);
  const sys = document.createElement("span"); sys.className = "room-system"; sys.setAttribute("aria-hidden", "true");
  const orbit = document.createElement("span"); orbit.className = "room-orbit";
  orbit.style.setProperty("--spin", `${8 + (i % 3) * 3}s`);
  const moon = document.createElement("span"); moon.className = "room-moon"; orbit.appendChild(moon);
  const planet = document.createElement("span"); planet.className = "room-planet";
  const pUrl = r.photo_path && state.urls[r.photo_path];
  if (pUrl) { planet.classList.add("has-photo"); planet.style.backgroundImage = `url("${pUrl.replace(/"/g, "%22")}")`; }
  sys.append(orbit, planet);
  if (r.locked) { const lk = document.createElement("span"); lk.className = "room-lock"; lk.textContent = "🔒"; lk.setAttribute("aria-label", "Locked"); sys.appendChild(lk); }
  const name = document.createElement("span"); name.className = "room-name"; name.textContent = roomTitle(r);
  const code = document.createElement("span"); code.className = "room-code";
  code.textContent = r.member ? fmtCode(r.code) + (r.locked ? "  · 🔒 locked" : "") : `${r.member_count || 0} in room${r.locked ? " · 🔒" : ""}`;
  c.append(sys, name, code);
  if (roomsState.edit && r.member) {
    const x = document.createElement("span"); x.className = "room-x"; x.textContent = "×"; x.setAttribute("aria-label", "Hide this room");
    c.appendChild(x);
  }
  // swipe a room left past the threshold to hide it (same as Edit then ×)
  let sx = null, swiped = false;
  const reset = () => { c.style.translate = ""; c.style.opacity = ""; };
  c.addEventListener("pointerdown", (e) => { if (roomsState.edit || !r.member) return; sx = e.clientX; swiped = false; try { c.setPointerCapture(e.pointerId); } catch {} });
  c.addEventListener("pointermove", (e) => {
    if (sx == null) return;
    const dx = Math.min(0, e.clientX - sx);
    if (dx < -8) swiped = true;
    c.style.translate = `${dx}px 0`; c.style.opacity = String(Math.max(0.35, 1 + dx / 220));
  });
  c.addEventListener("pointerup", (e) => {
    if (sx == null) return;
    const dx = e.clientX - sx; sx = null;
    if (dx < -110) return hideRoom(r.id);
    reset();
  });
  c.addEventListener("pointercancel", () => { sx = null; reset(); });
  c.onclick = (e) => {
    e.stopPropagation();
    if (swiped) { swiped = false; return; }
    if (!r.member) return openPeek(r);
    roomsState.edit ? hideRoom(r.id) : openRoom(r);
  };
  return c;
}
function hideRoom(id) {
  const v = roomsStore(); if (!v.hidden.includes(id)) v.hidden.push(id); roomsSave(v);
  renderRooms(); toast("Hidden from your menu. Enter its code to bring it back.", 3500);
}
function showRoom(id) { const v = roomsStore(); v.hidden = v.hidden.filter((x) => x !== id); roomsSave(v); renderRooms(); }
async function openRoom(r) {
  if (roomsState.busy) return;
  roomsState.busy = true;
  stopMenuMusic();
  try {
    if (state.board && state.board.id !== r.id) resetBoardState();
    await openBoard(r);
  } catch (e) { toast(e.message || "Couldn't open that room"); await showMenu(); }
  finally { roomsState.busy = false; }
}
function openRoomsFromBoard() {
  if (state.board) resetBoardState();
  showMenu();
}

// starfield + shooting stars behind the menu (runs only while the menu is open)
let starsRunning = false, starsT0 = 0;
const STAR_LIST = Array.from({ length: 170 }, () => ({ x: Math.random(), y: Math.random(), r: 0.4 + Math.random() * 1.4, ph: Math.random() * 6.28, sp: 0.004 + Math.random() * 0.012 }));
function startStars() {
  if (starsRunning) return;
  starsRunning = true; starsT0 = performance.now();
  const cv = $("#starCanvas"), ctx = cv.getContext("2d");
  let shoot = null, nextShoot = 2;
  const size = () => { const d = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * d; cv.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  size(); addEventListener("resize", size);
  const frame = (now) => {
    if ($("#menu").hidden) { starsRunning = false; removeEventListener("resize", size); return; }
    const t = (now - starsT0) / 1000;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const s of STAR_LIST) {
      const y = ((s.y * innerHeight + t * s.sp * 60) % innerHeight);
      ctx.globalAlpha = 0.35 + 0.5 * Math.abs(Math.sin(t * 1.3 + s.ph));
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(s.x * innerWidth, y, s.r, 0, 6.283); ctx.fill();
    }
    if (t > nextShoot && !shoot) { shoot = { x: Math.random() * innerWidth, y: 0, t0: t }; nextShoot = t + 6 + Math.random() * 8; }
    if (shoot) {
      const k = (t - shoot.t0) / 0.9;
      if (k > 1) shoot = null;
      else {
        const x = shoot.x + k * 260, y = shoot.y + k * 150;
        const g = ctx.createLinearGradient(x - 60, y - 35, x, y);
        g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(220,200,255,.9)");
        ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(x - 60, y - 35); ctx.lineTo(x, y); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// ambient space music for the menu: slow pads, drifting bells and a soft wind. Synthesized, no files.
let mAc = null, mBus = null, mMaster = null, mTimer = null, mNext = 0, mStep = 0;
let menuMusicOn = ls.get("pinned.menu.music", true) !== false;
const M_CHORDS = [[57, 60, 64, 67, 71], [53, 57, 60, 64, 69], [55, 59, 62, 66, 69], [52, 55, 59, 62, 67]];
const M_STEP = 1.5;   // seconds per step; a chord lasts 6 steps
const mMidi = (m) => 440 * Math.pow(2, (m - 69) / 12);
function mNoise(ctx, secs) { const n = Math.floor(ctx.sampleRate * secs), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return b; }
function mImpulse(ctx, secs, decay) { const n = Math.floor(ctx.sampleRate * secs), b = ctx.createBuffer(2, n, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); } return b; }
function menuMusicStart() {
  if (!menuMusicOn || mAc) return;
  try { mAc = new (window.AudioContext || window.webkitAudioContext)(); } catch { mAc = null; return; }
  if (mAc.state === "suspended") mAc.resume().catch(() => {});
  mMaster = mAc.createGain(); mMaster.gain.value = 0; mMaster.connect(mAc.destination);
  mMaster.gain.linearRampToValueAtTime(0.45, mAc.currentTime + 5);
  const verb = mAc.createConvolver(); verb.buffer = mImpulse(mAc, 5, 2.2);
  const wet = mAc.createGain(); wet.gain.value = 0.6; verb.connect(wet); wet.connect(mMaster);
  mBus = mAc.createGain(); mBus.gain.value = 0.7; mBus.connect(mMaster); mBus.connect(verb);
  const wind = mAc.createBufferSource(); wind.buffer = mNoise(mAc, 4); wind.loop = true;
  const bp = mAc.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 900; bp.Q.value = 0.3;
  const wg = mAc.createGain(); wg.gain.value = 0.02;
  const lfo = mAc.createOscillator(), lg = mAc.createGain(); lfo.frequency.value = 0.05; lg.gain.value = 0.015;
  lfo.connect(lg); lg.connect(wg.gain);
  wind.connect(bp); bp.connect(wg); wg.connect(mBus); wind.start(); lfo.start();
  mNext = mAc.currentTime + 0.4; mStep = 0;
  mTimer = setInterval(menuSchedule, 80);
}
function menuSchedule() {
  if (!mAc) return;
  while (mNext < mAc.currentTime + 0.6) { menuPlayStep(mStep, mNext); mNext += M_STEP; mStep++; }
}
function menuPlayStep(s, t) {
  const C = M_CHORDS[Math.floor(s / 6) % M_CHORDS.length];
  if (s % 6 === 0) {
    const d = 6 * M_STEP + 2.5;
    for (const m of C.slice(0, 4)) mPad(mMidi(m), t, d);
  }
  if (Math.random() < 0.7) {
    const m = C[Math.floor(Math.random() * C.length)] + 12 * (Math.random() < 0.5 ? 1 : 2);
    mBell(mMidi(m), t + Math.random() * 0.6);
  }
  if (Math.random() < 0.35) {
    const f = 1400 + Math.random() * 1200;
    mBell(f, t + Math.random() * 1.2, 0.04, 2.8, f * 0.8);   // stardust
  }
}
function mPad(f, t, d) {
  const o1 = mAc.createOscillator(), o2 = mAc.createOscillator(), g = mAc.createGain(), lp = mAc.createBiquadFilter();
  o1.type = "sine"; o2.type = "triangle"; o1.frequency.value = f; o2.frequency.value = f; o2.detune.value = 5;
  lp.type = "lowpass"; lp.frequency.value = 800; lp.Q.value = 0.5;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.028, t + 2.5);
  g.gain.setValueAtTime(0.028, t + d - 2.5); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o1.connect(lp); o2.connect(lp); lp.connect(g); g.connect(mBus);
  o1.start(t); o2.start(t); o1.stop(t + d + 0.1); o2.stop(t + d + 0.1);
}
function mBell(f, t, v = 0.05, d = 3.2, glideTo = null) {
  const o = mAc.createOscillator(), g = mAc.createGain();
  o.type = "sine"; o.frequency.setValueAtTime(f, t);
  if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + d);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(mBus); o.start(t); o.stop(t + d + 0.1);
}
function stopMenuMusic() {
  clearInterval(mTimer); mTimer = null;
  if (!mAc) return;
  const ac = mAc, master = mMaster; mAc = null;
  try { master.gain.cancelScheduledValues(ac.currentTime); master.gain.linearRampToValueAtTime(0, ac.currentTime + 1.2); } catch { /* ignore */ }
  setTimeout(() => ac.close().catch(() => {}), 1400);
}

// ---------------------------------------------------------------- welcome / pair
let welcomeColor = "c2";
function showWelcome() {
  show("#welcome");
  swatchRow($("#profileSwatches"), welcomeColor, (c) => (welcomeColor = c), "bright");
}
async function onWelcome() {
  const name = $("#nameInput").value.trim();
  if (!name) return setError($("#welcomeError"), "Add a name first.");
  setError($("#welcomeError"));
  const btn = $("#welcomeGo"); busy(btn, true, "One sec…");
  try {
    state.me = await api.signIn(name, welcomeColor);
    await showMenu();
  } catch (e) { setError($("#welcomeError"), e.message); }
  busy(btn, false);
}
let pendingJoinCode = null;
function handleJoinLink() {
  try {
    const c = new URLSearchParams(location.search).get("join");
    if (c) { pendingJoinCode = c.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8); history.replaceState(null, "", location.pathname); }
  } catch { /* ignore */ }
}
const inviteUrl = (code) => location.origin + location.pathname + "?join=" + (code || "").replace(/[^A-Za-z0-9]/gi, "").toUpperCase();
async function renderInviteQR(code) {
  const cv = $("#waitQR"), wrap = $("#waitQrWrap"); if (!cv || cv.dataset.tried) return;
  cv.dataset.tried = "1";
  try {
    const m = await import("https://cdn.jsdelivr.net/npm/qrcode@1.5.4/+esm");
    await (m.default || m).toCanvas(cv, inviteUrl(code), { width: 170, margin: 1, color: { dark: "#2d2416", light: "#ffffff" } });
    cv.dataset.ok = "1";
  } catch { if (wrap) { wrap.hidden = true; } $("#waitQrBtn").textContent = "Copy link"; }
}
// Rooms you're not in yet. An open room can be joined straight away. A locked room shows its lock and can't be joined.
let peekRoom = null;
function openPeek(r) {
  peekRoom = r;
  const n = r.member_count || 0, full = n >= 10;
  $("#peekName").textContent = roomTitle(r);
  $("#peekCount").textContent = `${n} ${n === 1 ? "person" : "people"} in this room`;
  $("#peekLock").hidden = !r.locked;
  $("#peekJoin").hidden = !!r.locked || full;
  $("#peekDelete").hidden = !r.can_delete;
  $("#peekNote").textContent = r.locked ? "This room is locked, so nobody new can join right now."
    : full ? "This room is full (10 people max)."
    : "It's open. Join and you'll be in the room straight away.";
  openSheet("roomPeek");
}
async function deletePeek() {
  const r = peekRoom; if (!r) return;
  if (!confirm(`Delete ${roomTitle(r)} for everyone? Its notes, photos and messages will be erased. This can't be undone.`)) return;
  const btn = $("#peekDelete"); busy(btn, true, "Deleting…");
  try {
    await api.deleteBoard(r.id);
    peekRoom = null; closeSheet("roomPeek");
    fxMapRemote({ fx: "room-gone", room: r.id });
    fxMapChannel().send({ fx: "room-gone", room: r.id });
    toast("Room deleted");
  } catch (e) { setError($("#peekError"), e.message || "Couldn't delete that room"); }
  busy(btn, false);
}
async function joinPeek() {
  if (!peekRoom) return;
  setError($("#peekError"));
  const btn = $("#peekJoin"); busy(btn, true, "Joining…");
  try {
    const b = await api.joinRoomById(peekRoom.id);
    peekRoom = null;
    closeSheet("roomPeek");
    markRoomOpened(b.id);
    toast("Joined 🎉");
    // open it the same way a room from your list opens (those carry my_bg and joined_at)
    await openRoom({ ...b, my_bg: null, joined_at: new Date().toISOString(), member: true });
    fxAnnounce("pop");
  } catch (e) { console.error("join room failed", e); setError($("#peekError"), e.message || "Couldn't join that room"); toast(e.message || "Couldn't join that room", 4000); }
  busy(btn, false);
}
// ---------------------------------------------------------------- fun tools
// Board screen: pick a tool (party popper, explosion, emoji burst), then tap the board to fire it.
// Everyone in the room sees it. Rooms also celebrate on their own: a joiner gets a party popper,
// a lock gets a sparkle, and a deleted room explodes on the map for everyone looking at it.
const FX_KINDS = ["pop", "boom", "burst", "sparkle"];
const FX_KEY_MUTE = "pinned.fxMuted";
let fxMuted = false, fxSel = null, fxLast = {}, fxCtx = null, fxCv = null, fxCx = null, fxParts = [], fxRaf = 0, fxShake = 0, fxMapCh = null;
try { fxMuted = ls.get(FX_KEY_MUTE, false) === true; } catch { /* storage blocked */ }
const FX_EMOJI = ["🎉", "🎊", "🥳", "✨", "🎈", "💖", "⭐", "🌟"];
const fxRand = (a, b) => a + Math.random() * (b - a);

function fxAudio() {
  if (fxMuted) return null;
  try {
    if (!fxCtx) fxCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (fxCtx.state === "suspended") fxCtx.resume();
    return fxCtx;
  } catch { return null; }   // audio can be blocked; the visuals still play
}
function fxTone(ctx, o) {
  const t = ctx.currentTime + (o.at || 0);
  const osc = ctx.createOscillator(), g = ctx.createGain();
  osc.type = o.type || "sine";
  osc.frequency.setValueAtTime(o.f, t);
  if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + o.dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(o.gain || 0.2, t + (o.attack || 0.01));
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
  let node = osc;
  if (o.lp) { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = o.lp; osc.connect(f); node = f; }
  node.connect(g); g.connect(ctx.destination);
  osc.start(t); osc.stop(t + o.dur + 0.05);
}
function fxNoise(ctx, o) {
  const len = Math.floor(ctx.sampleRate * o.dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, o.decay || 2);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = o.type || "bandpass"; f.frequency.value = o.f; f.Q.value = o.q || 1;
  const g = ctx.createGain(); g.gain.value = o.gain || 0.3;
  src.connect(f); f.connect(g); g.connect(ctx.destination);
  src.start(ctx.currentTime + (o.at || 0));
}
// party popper: a crack, then a bright upward whistle
function fxSndPop(ctx) {
  fxNoise(ctx, { dur: 0.12, f: 2500, q: 0.8, gain: 0.5, decay: 3 });
  fxTone(ctx, { type: "triangle", f: 400, f2: 1400, dur: 0.35, gain: 0.18 });
  fxTone(ctx, { type: "sine", f: 880, dur: 0.25, at: 0.12, gain: 0.12 });
}
// explosion: a deep boom with a rumbling tail
function fxSndBoom(ctx) {
  fxTone(ctx, { type: "sine", f: 120, f2: 28, dur: 0.7, gain: 0.9, attack: 0.005 });
  fxNoise(ctx, { dur: 0.9, f: 600, type: "lowpass", q: 0.7, gain: 0.8, decay: 2.2 });
}
// lock: a Chinese cymbal shimmer under a happy string chord
function fxSndSparkle(ctx) {
  fxNoise(ctx, { dur: 1.6, f: 7000, q: 2, gain: 0.25, decay: 1.5 });
  [1870, 2690, 3910].forEach((f, i) => fxTone(ctx, { type: "sine", f, dur: 2.2, gain: 0.05 / (i + 1), attack: 0.003 }));
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => fxTone(ctx, { type: "sawtooth", f, dur: 1.6, at: 0.12 + i * 0.07, gain: 0.07, attack: 0.12, lp: 2400 }));
}

function fxCanvas() {
  if (fxCx) return fxCx;
  fxCv = document.createElement("canvas"); fxCv.className = "fx-canvas"; fxCv.setAttribute("aria-hidden", "true");
  document.body.appendChild(fxCv); fxCx = fxCv.getContext("2d");
  const size = () => { const d = Math.min(window.devicePixelRatio || 1, 2); fxCv.width = innerWidth * d; fxCv.height = innerHeight * d; fxCx.setTransform(d, 0, 0, d, 0, 0); };
  size(); addEventListener("resize", size);
  return fxCx;
}
function fxSpawn(kind, x, y) {
  fxCanvas();
  const calm = prefersReducedMotion(), k = calm ? 0.35 : 1;
  const add = (p) => fxParts.push({ life: 0, max: 120, x, y, ...p });
  if (kind === "pop") {
    for (let i = 0; i < Math.round(110 * k); i++) add({ t: "conf", vx: fxRand(-7, 7), vy: fxRand(-13, -5), g: 0.22, max: 150, s: fxRand(5, 9), r: fxRand(0, 6), vr: fxRand(-0.2, 0.2), c: ["#ff5d8f", "#ffd166", "#06d6a0", "#4cc9f0", "#b388ff"][i % 5] });
  } else if (kind === "boom") {
    add({ t: "flash", max: 14 });
    add({ t: "ring", max: 30 });
    for (let i = 0; i < Math.round(70 * k); i++) { const a = fxRand(0, Math.PI * 2), s = fxRand(3, 12); add({ t: "spark", vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 0.18, max: fxRand(35, 60), c: i % 2 ? "#ffd166" : "#ff7b3a" }); }
    if (!calm) fxShake = 12;
  } else if (kind === "burst") {
    for (let i = 0; i < Math.round(16 * k); i++) add({ t: "emoji", vx: fxRand(-4, 4), vy: fxRand(-9, -4), g: 0.12, max: 120, ch: FX_EMOJI[i % FX_EMOJI.length], s: fxRand(26, 40) });
  } else if (kind === "sparkle") {
    for (let i = 0; i < Math.round(45 * k); i++) add({ t: "star", x: x + fxRand(-60, 60), y: y + fxRand(-40, 40), vx: fxRand(-0.6, 0.6), vy: fxRand(-1.6, -0.4), g: 0, max: fxRand(70, 110), s: fxRand(3, 7) });
  }
  if (!fxRaf) fxRaf = requestAnimationFrame(fxLoop);
}
function fxLoop() {
  const cx = fxCx; if (!cx) { fxRaf = 0; return; }
  cx.clearRect(0, 0, innerWidth, innerHeight);
  const shook = fxShake > 0;
  if (shook) { cx.save(); cx.translate(fxRand(-fxShake, fxShake), fxRand(-fxShake, fxShake)); fxShake *= 0.82; if (fxShake < 0.5) fxShake = 0; }
  for (const p of fxParts) {
    p.life++;
    const f = p.life / p.max;
    if (p.t === "conf" || p.t === "spark" || p.t === "emoji") { p.vx *= 0.99; p.vy += p.g; p.x += p.vx; p.y += p.vy; }
    if (p.t === "conf") p.r += p.vr;
    if (p.t === "star") { p.x += p.vx; p.y += p.vy; }
    cx.save(); cx.globalAlpha = Math.max(0, 1 - f * f);
    if (p.t === "conf") { cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); }
    else if (p.t === "spark") { cx.fillStyle = p.c; cx.beginPath(); cx.arc(p.x, p.y, 2.2 * (1 - f) + 0.6, 0, 7); cx.fill(); }
    else if (p.t === "emoji") { cx.font = `${p.s}px "Apple Color Emoji", "Segoe UI Emoji", system-ui, sans-serif`; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(p.ch, p.x, p.y); }
    else if (p.t === "star") { cx.fillStyle = "#ffe9a3"; cx.beginPath(); cx.arc(p.x, p.y, p.s * (0.4 + 0.6 * Math.abs(Math.sin(p.life * 0.3))) / 2, 0, 7); cx.fill(); }
    else if (p.t === "ring") { cx.strokeStyle = "rgba(255,240,200,.9)"; cx.lineWidth = 6 * (1 - f) + 1; cx.beginPath(); cx.arc(p.x, p.y, 220 * f, 0, 7); cx.stroke(); }
    else if (p.t === "flash") { const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 160); g.addColorStop(0, "rgba(255,250,220,.95)"); g.addColorStop(1, "rgba(255,200,120,0)"); cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, 160, 0, 7); cx.fill(); }
    cx.restore();
  }
  if (shook) cx.restore();
  fxParts = fxParts.filter((p) => p.life < p.max);
  if (fxParts.length) fxRaf = requestAnimationFrame(fxLoop);
  else { fxRaf = 0; cx.clearRect(0, 0, innerWidth, innerHeight); }
}
// play it here and, when announce is set, tell everyone in the room
function fxFire(kind, x, y, announce) {
  const ctx = fxAudio();
  if (ctx) { if (kind === "boom") fxSndBoom(ctx); else if (kind === "sparkle") fxSndSparkle(ctx); else fxSndPop(ctx); }
  fxSpawn(kind, x, y);
  if (announce && live) { try { live.send({ fx: kind, x: x / innerWidth, y: y / innerHeight }); } catch { /* offline: only shows here */ } }
}
// the room's own celebrations (joining, locking): shown here and sent to the room
function fxAnnounce(kind) { if (!state.board) return; fxFire(kind, innerWidth / 2, innerHeight * 0.4, true); }
// something from someone else in the room
function fxRemote(p) {
  if (!p || !FX_KINDS.includes(p.fx)) return;
  const x = Math.min(1, Math.max(0, Number(p.x) || 0)) * innerWidth, y = Math.min(1, Math.max(0, Number(p.y) || 0)) * innerHeight;
  fxFire(p.fx, x, y, false);
}
// the room map: a deleted room explodes on the planet for everyone looking at the map
function fxMapChannel() {
  if (!fxMapCh) fxMapCh = api.fx("map", (p) => fxMapRemote(p));
  return fxMapCh;
}
function fxMapRemote(p) {
  if (!p || p.fx !== "room-gone" || !p.room) return;
  if ($("#menu").hidden) return;
  const card = document.querySelector(`#roomGrid .room[data-id="${CSS.escape(p.room)}"]`);
  if (card) { const r = card.getBoundingClientRect(); fxFire("boom", r.x + r.width / 2, r.y + r.height * 0.4, false); }
  setTimeout(() => {
    roomsState.list = roomsState.list.filter((x) => x.id !== p.room);
    if (!$("#menu").hidden) renderRooms();
  }, card ? 700 : 0);
}
function fxSetSel(kind) {
  fxSel = fxSel === kind ? null : kind;
  document.querySelectorAll(".fun-btn[data-fx]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.fx === fxSel)));
}
function fxRenderMute() {
  const b = $("#funMute"); if (!b) return;
  b.textContent = fxMuted ? "🔇" : "🔊";
  b.setAttribute("aria-pressed", String(fxMuted));
  b.setAttribute("aria-label", fxMuted ? "Sound is off. Tap to turn on" : "Sound is on. Tap to turn off");
}
function fxInit() {
  document.querySelectorAll(".fun-btn[data-fx]").forEach((b) => { b.onclick = () => fxSetSel(b.dataset.fx); });
  $("#funMute").onclick = () => { fxMuted = !fxMuted; try { ls.set(FX_KEY_MUTE, fxMuted); } catch { /* storage blocked */ } fxRenderMute(); };
  fxRenderMute();
  $("#boardScreen").addEventListener("click", (e) => {
    if (!fxSel || !state.board) return;
    if (e.target.closest("button, input, textarea, select, a, label, .sheet, .sheet-backdrop, .fun-tray, .topbar, .histbar, [contenteditable]")) return;
    const now = Date.now();
    if (now - (fxLast[fxSel] || 0) < 600) return;   // cooldown so taps can't flood the screen
    fxLast[fxSel] = now;
    fxFire(fxSel, e.clientX, e.clientY, true);
  });
}
function showPair() {
  show("#pair");
  $("#pairBack").hidden = false;
  if (pendingJoinCode) {
    const inp = $("#codeInput"); inp.value = fmtCode(pendingJoinCode);
    setTimeout(() => { inp.scrollIntoView({ block: "center" }); inp.focus(); }, 200);
    toast("Code filled in — tap Join board");
  }
}
async function onCreateBoard() {
  const btn = $("#createBoard"); busy(btn, true, "Creating…"); setError($("#pairError"));
  try { await openBoard(await api.createBoard()); } catch (e) { setError($("#pairError"), e.message); }
  busy(btn, false);
}
async function onJoinBoard() {
  const code = $("#codeInput").value;
  if (code.replace(/[^a-z0-9]/gi, "").length < 8) return setError($("#pairError"), "Codes are 8 characters.");
  const btn = $("#joinBoard"); busy(btn, true, "Joining…"); setError($("#pairError"));
  try { await openBoard(await api.joinBoard(code)); fxAnnounce("pop"); } catch (e) { setError($("#pairError"), e.message); }
  busy(btn, false);
}

// ---------------------------------------------------------------- board
let ticker = null;
const boardHandlers = () => ({
  onInsert: (n) => { upsertNote(n, true); markPartnerSeen(); },
  onUpdate: (n) => { if (state.dragId !== n.id) upsertNote(n); },
  onDelete: (id) => removeNoteEl(id),
  onMembers: () => refreshMembers(),
  onReaction: onReactionEvent,
  onReply: onReplyEvent,
  onPing: onPingEvent,
  onAnswer: () => refreshQuestionDot(),
  onStroke: onStrokeEvent,
  onMessage: onMessageEvent,
  onRead: onReadEvent,
  onBgRequest: onBgRequestEvent,
  onBoard: onBoardEvent,
  onConn: onConnStatus,
});

// Phones pause backgrounded web apps and drop their live connection.
// When the app comes back, reconnect and pull anything that was missed (including "seen" ticks).
let lastResume = 0, hiddenAt = 0;
function onResume(force = false) {
  if (!state.board || document.visibilityState !== "visible") return;
  if (!force && Date.now() - lastResume < 3000) return;
  lastResume = Date.now();
  if (hiddenAt && Date.now() - hiddenAt > 20000) api.subscribe(state.board.id, boardHandlers());
  hiddenAt = 0;
  resync().catch(() => {});
  refreshMembers().catch(() => {});
  refreshQuestionDot();
  loadChats(); loadBgRequests();
  api.getBoard?.(state.board.id).then((b) => b && onBoardEvent(b)).catch(() => {});
  markThreadRead();
  clearBadge();
  // phones drop the geolocation watch when backgrounded; restart it if we're meant to be sharing
  if (geo.on && geo.watch == null && !geo.denied && state.board) {
    geo.watch = navigator.geolocation.watchPosition(onGeoOk, onGeoErr, { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 });
  }
}
async function openBoard(board) {
  stopMenuMusic();
  state.board = board;
  markRoomOpened(board.id);
  show("#boardScreen");
  const sk = $("#boardSkeleton"); if (sk) sk.hidden = false;
  await refreshMembers();
  await resync();
  initView();
  if (sk) sk.hidden = true;
  applyBackground();
  loadChats();
  loadBgRequests();
  renderRoomHead(); ensureRoomPhoto(); renderHistBar();
  api.subscribe(board.id, boardHandlers());
  live = api.live(board.id, state.me, { onMessage: onLiveMessage, onPresence: onPresence });
  api.touchSeen(board.id);
  // restore live-location sharing if it was on for this board
  geo.on = false; geo.me = null; geo.watch = null; geo.denied = false;
  if (ls.get(geoKey(), false)) startGeo();
  updateLocDot();
  refreshPushSubscription();
  refreshQuestionDot();
  clearBadge();
  // keep countdowns and scheduled notes current; pick up scheduled notes as their time comes
  clearInterval(ticker);
  let n = 0;
  ticker = setInterval(() => {
    tickNotes();
    expireCursors();
    if (document.visibilityState === "visible" && ++n % 4 === 0) api.touchSeen(state.board.id);
    if (document.visibilityState === "visible") { resync().catch(() => {}); refreshReads(); }
    flushOutbox();
  }, 30000);
  renderHistBar();
  updateConn();
  flushOutbox();
}

async function resync() {
  if (!state.board) return;
  const rows = await api.listNotes(state.board.id);
  const ids = new Set(rows.map((r) => r.id));
  for (const id of [...state.notes.keys()]) if (!ids.has(id) && !state.notes.get(id)?._pending) removeNoteEl(id);
  await loadUrls(rows);
  await loadExtras();
  for (const r of rows) upsertNote(r);
  updateEmpty();
  markPartnerSeen();
}

async function loadExtras() {
  try {
    const strokes = await api.listStrokes(state.board.id);
    const ids = new Set(strokes.map((s) => s.id));
    for (const id of [...state.strokes.keys()]) if (!ids.has(id)) removeInk(id);
    for (const s of strokes) addInk(s);
  } catch { /* strokes arrive with the v4 upgrade */ }
  try {
    const [rs, reps, pings] = await Promise.all([api.listReactions(state.board.id), api.listReplies(state.board.id), api.listPings(state.board.id)]);
    state.reactions = groupBy(rs, "note_id");
    state.replies = groupBy(reps, "note_id");
    state.pings = pings;
    state.v2 = true;
    renderChips();
  } catch (e) {
    if (state.v2) console.warn("v2 tables not ready", e.message);
    state.v2 = false;
  }
}

function groupBy(rows, key) {
  const m = new Map();
  for (const r of rows) { if (!m.has(r[key])) m.set(r[key], []); m.get(r[key]).push(r); }
  return m;
}

async function loadUrls(rows) {
  const paths = rows.map((r) => r.media_path).filter((p) => p && !state.urls[p]);
  if (paths.length) Object.assign(state.urls, await api.mediaUrls(paths));
}

async function ensureAvatars(members) {
  const paths = members.map((m) => m.avatar_path).filter((p) => p && !state.urls[p]);
  if (!paths.length) return;
  try { const urls = await api.mediaUrls(paths); Object.assign(state.urls, urls); } catch { /* ignore */ }
}
async function refreshMembers() {
  if (!state.board) return;
  state.members = await api.members(state.board.id);
  await ensureAvatars(state.members);
  if (state.me && !state.members.some((m) => m.id === state.me.id)) {
    // removed from the board, or it was deleted
    if (leaving) return;
    resetBoardState();
    toast("This board was deleted, or you were removed from it");
    return showMenu();
  }
  renderChips();
  const waiting = state.members.length < 2;
  $("#waitBanner").hidden = !waiting;
  $("#waitCode").textContent = fmtCode(state.board.code);
  if (waiting) renderInviteQR(state.board.code);
  renderMemberList();
  for (const n of state.notes.values()) { const el = noteEl(n.id); if (el) decorate(el, n); }
}

function latestMood(userId) {
  const p = state.pings.find((x) => x.user_id === userId && x.kind.startsWith("mood_"));
  return p && Date.now() - new Date(p.created_at).getTime() < 24 * 3600 * 1000 ? PING_EMOJI[p.kind] : null;
}

function isOnline(id) { const p = state.presence[id]; return !!p && p.visible !== false; }
function isActive(id) { const c = state.cursors.get(id); return isOnline(id) && !!c && Date.now() - c.at < 15000; }

function chipEl(m) {
  const c = document.createElement("span");
  c.className = "chip"; c.style.background = BRIGHT[m.color] || BRIGHT.c1;
  const av = m.avatar_path && state.urls[m.avatar_path];
  if (av) { c.classList.add("has-av"); c.style.backgroundImage = `url("${av}")`; c.textContent = ""; }
  else c.textContent = (m.name || "?").slice(0, 1).toUpperCase();
  c.title = m.name;
  const mood = latestMood(m.id);
  if (mood) { const i = document.createElement("i"); i.className = "mood"; i.textContent = mood; c.appendChild(i); }
  if (m.id !== state.me?.id && isOnline(m.id)) { const o = document.createElement("i"); o.className = "on"; c.appendChild(o); }
  return c;
}

function renderChips() {
  const chips = $("#memberChips"); chips.innerHTML = "";
  // you first, then whoever is online, then everyone else
  const list = [...state.members].sort((a, b) => (a.id === state.me?.id ? -1 : b.id === state.me?.id ? 1 : isOnline(b.id) - isOnline(a.id)));
  const max = 4;
  for (const m of list.slice(0, max)) chips.appendChild(chipEl(m));
  if (list.length > max) { const more = document.createElement("span"); more.className = "chip more"; more.textContent = "+" + (list.length - max); chips.appendChild(more); }
  if (!$("#people").hidden) renderPeople();
}

function openPeople() { renderPeople(); renderVoiceJoin(); $("#people").hidden = false; $("#peopleBackdrop").hidden = false; refreshMembers().catch(() => {}); }
function closePeople() { $("#people").hidden = true; $("#peopleBackdrop").hidden = true; }

function renderPeople() {
  const ul = $("#peopleList"); ul.innerHTML = "";
  const list = [...state.members].sort((a, b) => (a.id === state.me?.id ? -1 : b.id === state.me?.id ? 1 : (isActive(b.id) - isActive(a.id)) || (isOnline(b.id) - isOnline(a.id))));
  $("#peopleCount").textContent = `${state.members.length} of 10 · ${list.filter((m) => m.id !== state.me?.id && isOnline(m.id)).length} online`;
  $("#peopleCode").textContent = fmtCode(state.board?.code);
  for (const m of list) {
    const li = document.createElement("li");
    li.appendChild(chipEl(m));
    const info = document.createElement("div"); info.className = "info";
    const nm = document.createElement("div"); nm.className = "nm"; nm.textContent = m.name + (m.id === state.me?.id ? " (you)" : "");
    if (m.id === state.board?.created_by) { const o = document.createElement("small"); o.textContent = "owner"; nm.appendChild(o); }
    const st = document.createElement("div"); st.className = "st"; st.appendChild(document.createElement("i"));
    let txt;
    if (m.id === state.me?.id) { txt = "Online"; st.classList.add("online"); }
    else if (isActive(m.id)) { txt = state.presence[m.id]?.doodling ? "Active now · drawing together" : "Active now"; st.classList.add("active"); }
    else if (isOnline(m.id)) { txt = "Online"; st.classList.add("online"); }
    else txt = m.last_seen ? `Last seen ${timeAgo(m.last_seen)}` : "Offline";
    st.appendChild(document.createTextNode(txt));
    info.append(nm, st);
    if (m.bio) { const b = document.createElement("div"); b.className = "bio"; b.textContent = m.bio; info.appendChild(b); }
    li.appendChild(info);
    if (m.id !== state.me?.id) {
      const b = document.createElement("button"); b.className = "btn small"; b.textContent = "Find";
      b.disabled = !state.views[m.id];
      b.title = state.views[m.id] ? `Jump to where ${m.name} is looking` : `${m.name} isn't on the board right now`;
      b.onclick = () => { closePeople(); findPerson(m.id); };
      li.appendChild(b);
    }
    ul.appendChild(li);
  }
}

// ================================================================ live location (opt-in, both ways)
// Each person shares their OWN location and can see anyone else who is sharing.
// It's broadcast over the live presence channel only — never saved to the database.
const geo = { on: false, watch: null, me: null, lastSent: 0, denied: false };
const geoKey = () => "pinned-geo-" + (state.board?.id || "");


function startGeo() {
  if (!("geolocation" in navigator)) { toast("This device can't share location."); return; }
  geo.on = true; geo.denied = false;
  try { ls.set(geoKey(), true); } catch { /* ignore */ }
  renderLoc(); updateLocDot();
  geo.watch = navigator.geolocation.watchPosition(onGeoOk, onGeoErr, { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 });
}
function stopGeo(silent = false) {
  geo.on = false; geo.me = null;
  if (geo.watch != null) { try { navigator.geolocation.clearWatch(geo.watch); } catch { /* ignore */ } geo.watch = null; }
  try { ls.set(geoKey(), false); } catch { /* ignore */ }
  live?.track({ loc: null });            // clear it for everyone right away
  if (!silent) renderLoc();
  updateLocDot();
}
function onGeoOk(pos) {
  const c = pos.coords;
  geo.me = { lat: c.latitude, lng: c.longitude, acc: c.accuracy, at: Date.now() };
  const now = Date.now();
  // send at most every 5s (presence updates are cheap but no need to spam)
  if (now - geo.lastSent > 5000 || !geo.lastSent) { geo.lastSent = now; live?.track({ loc: geo.me }); }
  renderLoc();
}
function onGeoErr(err) {
  if (err && err.code === 1) {            // permission denied
    geo.denied = true; stopGeo(true);
    toast("Location permission was blocked. Turn it on for this site in your phone's settings, then try again.", 5000);
  } else toast("Couldn't get your location. Make sure location is on.", 4000);
  renderLoc();
}

// ---- Live map (Batch C) ----
// Leaflet (map library) is loaded the first time the map opens, from jsDelivr with a pinned version and checksums.
const LEAFLET = {
  css: { href: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css", integrity: "sha384-sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H" },
  js: { src: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js", integrity: "sha384-cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH" },
};
let leafletLoading = null, mapInst = null, mapLayer = null;
function loadLeaflet() {
  if (window.L) return Promise.resolve();
  if (leafletLoading) return leafletLoading;
  leafletLoading = new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet"; css.href = LEAFLET.css.href; css.integrity = LEAFLET.css.integrity; css.crossOrigin = "anonymous";
    document.head.appendChild(css);
    const s = document.createElement("script");
    s.src = LEAFLET.js.src; s.integrity = LEAFLET.js.integrity; s.crossOrigin = "anonymous";
    s.onload = () => resolve();
    s.onerror = () => { leafletLoading = null; reject(new Error("map library")); };
    document.head.appendChild(s);
  });
  return leafletLoading;
}

async function openMap() {
  const model = buildMapModel(sharers());
  if (model.empty) return toast("Nobody is sharing their location right now", 3000);
  closeLoc();
  openSheet("map");
  const pairs = $("#mapPairs"); pairs.innerHTML = "";
  for (const p of model.pairs) {
    const li = document.createElement("li");
    li.textContent = `${p.name}: ${fmtDist(p.meters)} ${compassOf(p.bearing)}${p.acc != null ? ` · ${fmtAcc(p.acc)}` : ""}`;
    pairs.appendChild(li);
  }
  if (!model.pairs.length) {
    const li = document.createElement("li"); li.className = "loc-empty";
    li.textContent = geo.on ? "Distances appear once your partner is sharing too." : "Turn on sharing to see distances.";
    pairs.appendChild(li);
  }
  try { await loadLeaflet(); }
  catch { $("#mapBox").textContent = "The map needs internet. The distances are listed below."; return; }
  if (!mapInst) {
    mapInst = L.map("mapBox", { zoomControl: true, attributionControl: true });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(mapInst);
    mapLayer = L.layerGroup().addTo(mapInst);
  }
  mapLayer.clearLayers();
  const me = model.markers.find((m) => m.me);
  for (const m of model.markers) {
    L.circleMarker([m.lat, m.lng], { radius: m.me ? 9 : 7, color: "#ffffff", weight: 2, fillColor: m.me ? "#e63946" : "#3a86ff", fillOpacity: 1 })
      .bindTooltip(m.me ? "You" : m.name).addTo(mapLayer);
  }
  if (me) for (const m of model.markers.filter((x) => !x.me)) L.polyline([[me.lat, me.lng], [m.lat, m.lng]], { color: "#e63946", weight: 2, dashArray: "6 6" }).addTo(mapLayer);
  mapInst.fitBounds(model.bounds, { padding: [30, 30], maxZoom: 16 });
  setTimeout(() => mapInst && mapInst.invalidateSize(), 60);   // the sheet was hidden until just now
}

function toggleGeo() {
  if (geo.on) stopGeo(); else startGeo();
}

function openLoc() {
  closePeople();
  renderLoc();
  $("#locPanel").hidden = false; $("#locBackdrop").hidden = false;
}
function closeLoc() { $("#locPanel").hidden = true; $("#locBackdrop").hidden = true; }

function sharers() {
  // everyone (incl. me) who currently has a location on the board
  const out = [];
  if (geo.on && geo.me) out.push({ id: state.me.id, loc: geo.me, me: true });
  for (const m of others()) { const p = state.presence[m.id]; if (p && p.loc && isOnline(m.id)) out.push({ id: m.id, loc: p.loc, me: false }); }
  return out;
}

function updateLocDot() {
  const anyone = sharers().length > 0;
  const d = $("#locDot"); if (d) d.hidden = !anyone;
  const btn = $("#toolLoc"); if (btn) btn.setAttribute("aria-pressed", String(geo.on));
}

function renderLoc() {
  updateLocDot();
  if ($("#locPanel").hidden) return;
  const sw = $("#locSwitch");
  sw.setAttribute("aria-checked", String(geo.on));
  $("#locMyState").textContent = geo.on
    ? (geo.me ? `On · updated ${timeAgo(new Date(geo.me.at).toISOString())}` : "On · getting your location…")
    : (geo.denied ? "Blocked in your phone's settings" : "Off");
  const list = sharers().filter((s) => !s.me);
  $("#locCount").textContent = geo.on ? `${list.length} sharing with you` : "";
  const ul = $("#locList"); ul.innerHTML = "";
  if (!geo.on) return;
  if (!list.length) {
    const li = document.createElement("li"); li.className = "loc-empty";
    li.textContent = others().length ? "Nobody else is sharing right now. They'll show up here when they turn it on." : "Invite someone to the board first.";
    ul.appendChild(li); return;
  }
  for (const s of list) {
    const m = memberById(s.id) || { name: "Someone", color: "c1" };
    const li = document.createElement("li");
    li.appendChild(chipEl({ ...m, id: s.id }));
    const info = document.createElement("div"); info.className = "info";
    info.appendChild(Object.assign(document.createElement("div"), { className: "nm", textContent: m.name }));
    const st = document.createElement("div"); st.className = "st";
    if (geo.me) {
      const dist = haversine(geo.me, s.loc), dir = compassOf(bearing(geo.me, s.loc));
      st.textContent = `${fmtDist(dist)} ${dir} · ${fmtAcc(s.loc.acc)} · ${timeAgo(new Date(s.loc.at).toISOString())}`;
    } else st.textContent = `${fmtAcc(s.loc.acc)} · ${timeAgo(new Date(s.loc.at).toISOString())}`;
    info.appendChild(st);
    li.appendChild(info);
    const a = document.createElement("a"); a.className = "btn small"; a.textContent = "Map";
    a.href = `https://www.google.com/maps?q=${s.loc.lat},${s.loc.lng}`; a.target = "_blank"; a.rel = "noopener";
    li.appendChild(a);
    ul.appendChild(li);
  }
}

// ================================================================ endless canvas
// world coords: notes keep x/y forever. screen = world * s + t
const MIN_S = 0.08, MAX_S = 3;   // 8% lets you see a big area of the board at once
let viewRaf = 0, viewSaveT = 0, viewSendT = 0;
function vp() { return $("#scroller").getBoundingClientRect(); }
function toWorld(cx, cy) { const r = vp(), v = state.view; return { x: (cx - r.left - v.tx) / v.s, y: (cy - r.top - v.ty) / v.s }; }

function applyView() {
  if (viewRaf) return;
  viewRaf = requestAnimationFrame(() => {
    viewRaf = 0;
    const { tx, ty, s } = state.view;
    $("#board").style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    const sc = $("#scroller");
    sc.style.backgroundPosition = `${tx}px ${ty}px`;
    for (const el of document.querySelectorAll("#cursors .cursor")) placeCursor(el);
    if (sel) renderSel();
    const now = Date.now();
    if (state.board && now - viewSaveT > 400) { viewSaveT = now; ls.set("pinned-view-" + state.board.id, state.view); }
    if (now - viewSendT > 500) { viewSendT = now; sendView(); }
  });
}

function sendView() {
  if (!live || !state.me || document.visibilityState !== "visible") return;
  const r = vp(), c = toWorld(r.left + r.width / 2, r.top + r.height / 2);
  live.send({ t: "view", u: state.me.id, cx: Math.round(c.x), cy: Math.round(c.y), s: +state.view.s.toFixed(2) });
}

function setView(v, animate = false) {
  const target = { tx: v.tx, ty: v.ty, s: Math.min(MAX_S, Math.max(MIN_S, v.s)) };
  if (!animate) { state.view = target; return applyView(); }
  const from = { ...state.view }, t0 = performance.now(), dur = 380;
  const step = (t) => {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    state.view = { tx: from.tx + (target.tx - from.tx) * e, ty: from.ty + (target.ty - from.ty) * e, s: from.s + (target.s - from.s) * e };
    applyView();
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function centerOn(wx, wy, s, animate = true) {
  const r = vp();
  setView({ s, tx: r.width / 2 - wx * s, ty: r.height / 2 - wy * s }, animate);
}

function zoomAt(cx, cy, factor) {
  const v = state.view, r = vp();
  const s = Math.min(MAX_S, Math.max(MIN_S, v.s * factor));
  const wx = (cx - r.left - v.tx) / v.s, wy = (cy - r.top - v.ty) / v.s;
  setView({ s, tx: cx - r.left - wx * s, ty: cy - r.top - wy * s });
}

function noteBox(n) {
  const el = noteEl(n.id), s = n.scale || 1;
  const w = el ? el.offsetWidth : 150, h = el ? el.offsetHeight : 150;
  return { x: n.x - (w * s - w) / 2, y: n.y - (h * s - h) / 2, w: w * s, h: h * s };
}

function goHome(animate = true) {
  const r = vp();
  const notes = [...state.notes.values()].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 6);
  if (!notes.length) return centerOn(BOARD_W / 2, 320, Math.min(1.2, Math.max(0.6, r.width / BOARD_W)), animate);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const n of notes) { const b = noteBox(n); x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h); }
  const pad = 40;
  const s = Math.min(1.2, Math.max(MIN_S, Math.min(r.width / (x1 - x0 + pad * 2), (r.height - 140) / (y1 - y0 + pad * 2))));
  centerOn((x0 + x1) / 2, (y0 + y1) / 2 + 30 / s, s, animate);
}

function initView() {
  const saved = ls.get("pinned-view-" + state.board.id);
  if (saved && isFinite(saved.s)) setView(saved);
  else goHome(false);
}

function findPerson(id) {
  const v = state.views[id];
  const m = memberById(id);
  if (!v) return toast(`${m?.name || "They"} isn't on the board right now`);
  centerOn(v.cx, v.cy, v.s || 1);
  toast(`Here's where ${m?.name || "they"} ${isOnline(id) ? "is" : "was"} looking 👀`);
}

function findSomeone() {
  const list = others().filter((m) => state.views[m.id]);
  if (!list.length) return toast(others().length ? "Nobody else is on the board right now" : "It's just you on this board so far");
  // most recently active first
  list.sort((a, b) => (state.views[b.id].at || 0) - (state.views[a.id].at || 0));
  findPerson(list[0].id);
}

function layoutBoard() { applyView(); }

// ---------------------------------------------------------------- gestures
// One gesture system for the whole canvas:
//   touch: drag empty space = pan · hold a note then drag = move it · tap a note = open · two fingers = pinch zoom
//   mouse: drag empty space = pan · drag a note = move it · click = open · wheel = zoom
//   draw mode: one finger/mouse draws · two fingers still pan and zoom
const pointers = new Map();
let gest = null, pinch = null;

function wireCanvas() {
  const sc = $("#scroller");
  sc.addEventListener("pointerdown", onDown);
  sc.addEventListener("pointermove", onMove);
  sc.addEventListener("pointerup", onUp);
  sc.addEventListener("pointercancel", onUp);
  sc.addEventListener("lostpointercapture", (e) => { if (pointers.has(e.pointerId)) onUp(e); });
  sc.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (e.shiftKey && !e.ctrlKey) { setView({ ...state.view, tx: state.view.tx - (e.deltaX || e.deltaY), ty: state.view.ty }); return; }
    zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)));
  }, { passive: false });
  sc.addEventListener("contextmenu", (e) => { e.preventDefault(); const el = e.target.closest?.("#board .note"); if (el?.dataset.id) openNoteMenu(el.dataset.id); });
  sc.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") sendCursor(null); });
}

function onDown(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  $("#scroller").setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 2) return startPinch();
  if (pointers.size > 2) return;
  const touch = e.pointerType !== "mouse";
  const handle = e.target.closest?.("#sel .h");
  if (handle && sel) { gest = { id: e.pointerId, sx: e.clientX, sy: e.clientY, touch, type: handle.dataset.h === "rot" ? "rotate" : "resize" }; beginTransform(e); return; }
  const noteT = e.target.closest?.("#board .note");
  gest = { id: e.pointerId, sx: e.clientX, sy: e.clientY, touch, noteId: noteT?.dataset.id || null, strokeId: null, type: "pending",
    ctl: e.target.closest?.(".lk-play, .lk-stop, .lk-open")?.className || null };
  if (inkMode) { gest.type = "ink"; inkStart(e); return; }
  if (!gest.noteId) gest.strokeId = hitOwnStroke(e);
  gest.selected = !!sel && (sel.id === gest.noteId || sel.id === gest.strokeId);
  if (gest.noteId && touch && !gest.selected) gest.hold = setTimeout(() => { if (gest?.type === "pending") startNoteDrag(); }, 280);
  if (gest.noteId && touch) gest.press = setTimeout(() => openNoteMenu(gest.noteId), 560);
  if (gest.noteId && e.button === 2) gest.type = "rightclick";
}

function onMove(e) {
  sendCursor(e);
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch) return movePinch();
  if (!gest || gest.id !== e.pointerId) return;
  const dx = e.clientX - gest.sx, dy = e.clientY - gest.sy;
  if (gest.press && Math.hypot(dx, dy) > 8) clearTimeout(gest.press);
  if (gest.type === "ink") return inkMove(e);
  if (gest.type === "resize" || gest.type === "rotate") return moveTransform(e);
  if (gest.type === "pending" && Math.hypot(dx, dy) > 7) {
    clearTimeout(gest.hold);
    if (gest.noteId && (!gest.touch || gest.selected)) startNoteDrag();
    else if (gest.strokeId && gest.selected) startStrokeDrag();
    else { gest.type = "pan"; gest.tx = state.view.tx; gest.ty = state.view.ty; $("#scroller").classList.add("panning"); }
  }
  if (gest.type === "pan") setView({ s: state.view.s, tx: gest.tx + dx, ty: gest.ty + dy });
  if (gest.type === "note") moveNoteDrag(dx, dy);
  if (gest.type === "sdrag") { sel.pv.dx = dx / state.view.s; sel.pv.dy = dy / state.view.s; previewStroke(); }
}

function onUp(e) {
  pointers.delete(e.pointerId);
  if (pinch) { if (pointers.size < 2) { const p = pinch; pinch = null; gest = null; if (p.item) commitTransform(); } return; }
  if (!gest || gest.id !== e.pointerId) return;
  clearTimeout(gest.hold); clearTimeout(gest.press);
  const g = gest; gest = null;
  $("#scroller").classList.remove("panning");
  if (g.type === "ink") inkEnd();
  else if (g.type === "note") endNoteDrag(g);
  else if (g.type === "resize" || g.type === "rotate" || g.type === "sdrag") commitTransform();
  else if (g.type === "pending" && e.type === "pointerup") {
    if (g.touch) swallowGhostClick();
    onTap(g);
  }
  else if (g.type === "menu" && g.touch) swallowGhostClick();   // the note menu just opened under this finger
  if (g.touch) sendCursor(null);
}

// Long-press (touch) or right-click (mouse) on a note: a small action sheet.
// It reuses the detail sheet's own buttons, so the rules for edit, pin and delete stay in one place.
function openNoteMenu(id) {
  const n = state.notes.get(id); if (!n) return;
  if (gest && gest.noteId !== id) return;
  if (gest && gest.type === "note") {
    // a lifted drag that never moved: put the note back exactly where it was
    const el = noteEl(id);
    n.x = gest.ox; n.y = gest.oy; delete n._dragFrom; state.dragId = null;
    el?.classList.remove("dragging");
    if (el) placeNote(el, n);
  }
  if (gest) gest.type = "menu";
  if (navigator.vibrate) navigator.vibrate(15);
  const mine = canEdit(n);
  const items = [
    ["Open", () => openDetail(id)],
    ["Reply", () => { openDetail(id); setTimeout(() => $("#replyInput")?.focus(), 250); }],
  ];
  if (mine) items.push(
    ["Edit", () => { openDetail(id); $("#detailEdit")?.click(); }],
    [n.pinned ? "Unpin" : "Pin", () => { openDetail(id); $("#detailPin")?.click(); }],
    ["Delete", () => { openDetail(id); $("#detailRemove")?.click(); }],
  );
  const list = $("#nmList"); list.innerHTML = "";
  for (const [label, fn] of items) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "more-row" + (label === "Delete" ? " danger-row" : "");
    const t = document.createElement("span"); t.textContent = label;
    const c = document.createElement("i"); c.setAttribute("aria-hidden", "true"); c.textContent = "›";
    b.append(t, c);
    b.onclick = () => { closeSheet("noteMenu"); fn(); };
    list.appendChild(b);
  }
  openSheet("noteMenu");
}

// tap: select something you can edit; tap it again (or anything you can't edit) to open it
function onTap(g) {
  if (g.noteId) {
    const n = state.notes.get(g.noteId); if (!n) return;
    if (g.ctl && n.kind === "link") {
      if (/lk-open/.test(g.ctl)) { window.open(n.meta?.url, "_blank", "noopener"); return; }
      return playCard(n.id);
    }
    if (sel?.type === "note" && sel.id === n.id) { deselect(); return openDetail(n.id); }
    if (canEdit(n)) return select("note", n.id);
    deselect();
    return openDetail(n.id);
  }
  if (g.strokeId) return select("stroke", g.strokeId);
  deselect();
}

// After a touch tap, phones fire a delayed "click" at the same spot. If a sheet or toolbar has just
// appeared there, that click would hit it, so eat it.
function swallowGhostClick() {
  const eat = (ev) => { ev.stopPropagation(); ev.preventDefault(); document.removeEventListener("click", eat, true); };
  document.addEventListener("click", eat, true);   // only the one ghost click
  setTimeout(() => document.removeEventListener("click", eat, true), 450);
}

function startPinch() {
  const onItem = gest && sel && (gest.selected || gest.type === "note" && gest.noteId === sel.id);
  if (gest) {
    clearTimeout(gest.hold);
    if (gest.type === "ink") inkCancel();
    if (gest.type === "note") endNoteDrag(gest);
    gest = null;
  }
  const [a, b] = [...pointers.values()];
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  pinch = { d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, a0: Math.atan2(b.y - a.y, b.x - a.x), s0: state.view.s, w: toWorld(mid.x, mid.y) };
  if (onItem) { pinch.item = true; beginTransform(null); }   // two fingers on the selected item: resize + twist it
}

function movePinch() {
  const [a, b] = [...pointers.values()]; if (!a || !b) return;
  const d = Math.hypot(a.x - b.x, a.y - b.y), ang = Math.atan2(b.y - a.y, b.x - a.x);
  if (pinch.item) {
    applyTransform(d / pinch.d0, (ang - pinch.a0) * 180 / Math.PI);
    return;
  }
  const r = vp();
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const s = Math.min(MAX_S, Math.max(MIN_S, pinch.s0 * d / pinch.d0));
  setView({ s, tx: mid.x - r.left - pinch.w.x * s, ty: mid.y - r.top - pinch.w.y * s });
}

function startNoteDrag() {
  const n = state.notes.get(gest.noteId); const el = noteEl(gest.noteId);
  if (!n || !el) return;
  if (n.pinned) {
    toast("It's pinned. Tap it and choose Unpin to move it.");
    gest.type = "pan"; gest.tx = state.view.tx; gest.ty = state.view.ty; gest.sx = pointers.get(gest.id)?.x ?? gest.sx; gest.sy = pointers.get(gest.id)?.y ?? gest.sy;
    return;
  }
  gest.type = "note"; gest.ox = n.x; gest.oy = n.y;
  n._dragFrom = { x: n.x, y: n.y, z: n.z };
  state.dragId = n.id;
  el.classList.add("dragging");
  el.style.zIndex = "2147483000";
  el.style.transform = noteTransform(n, "scale(1.06)");
  if (navigator.vibrate) navigator.vibrate(12);
}

function moveNoteDrag(dx, dy) {
  const n = state.notes.get(gest.noteId), el = noteEl(gest.noteId); if (!n || !el) return;
  n.x = Math.round(gest.ox + dx / state.view.s); n.y = Math.round(gest.oy + dy / state.view.s);
  el.style.left = n.x + "px"; el.style.top = n.y + "px";
  if (sel?.id === n.id) renderSel();
}

async function endNoteDrag(g) {
  const n = state.notes.get(g.noteId), el = noteEl(g.noteId);
  if (!n || !el) return;
  el.classList.remove("dragging");
  n.z = Date.now();
  placeNote(el, n);
  const from = n._dragFrom; delete n._dragFrom;
  const to = { x: n.x, y: n.y, z: n.z };
  const moved = from && (Math.abs(from.x - to.x) > 1 || Math.abs(from.y - to.y) > 1);
  try {
    await api.updateNote(n.id, to);
    if (moved) pushHist({ label: "move", undo: () => moveNoteTo(n.id, from), redo: () => moveNoteTo(n.id, to) });
  } catch (e) {
    if (isNetworkError(e)) { updateConn(); toast("Offline — reconnect to save where you moved it", 3000); }
    else toast("Couldn't save the move");
  }
  setTimeout(() => { if (state.dragId === n.id) state.dragId = null; }, 600);
}
async function moveNoteTo(id, pos) {
  const n = state.notes.get(id); if (!n) return;
  Object.assign(n, pos); const el = noteEl(id); if (el) placeNote(el, n);
  await api.updateNote(id, pos);
}

// ================================================================ select · resize · rotate · flip
// sel = { type: "note" | "stroke", id, pv: live preview for lines {dx, dy, sc, rot, fx, fy}, t0: values when a transform began }
let sel = null;

function canEdit(n) { return n.author_id === state.me?.id || state.board?.created_by === state.me?.id; }

function hitOwnStroke(e) {
  const w = toWorld(e.clientX, e.clientY), r = 12 / state.view.s;
  const list = [...state.strokes.values()].filter((s) => s.author_id === state.me?.id && !s._live).reverse();
  for (const s of list) {
    const pad = r + s.width / 2;
    if (s.points.some(([x, y]) => Math.abs(x - w.x) < pad && Math.abs(y - w.y) < pad && Math.hypot(x - w.x, y - w.y) < pad)) return s.id;
  }
  return null;
}

function strokeBox(s) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of s.points) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const p = s.width / 2 + 4;
  return { x: x0 - p, y: y0 - p, w: x1 - x0 + p * 2, h: y1 - y0 + p * 2 };
}

function select(type, id) {
  if (sel && sel.id !== id) deselect();
  sel = { type, id, pv: { dx: 0, dy: 0, sc: 1, rot: 0, fx: 1, fy: 1 } };
  document.body.classList.add("selecting");
  $("#selBar").hidden = false;
  const isNote = type === "note";
  for (const b of document.querySelectorAll("#selBar [data-for]")) b.hidden = b.dataset.for !== (isNote ? "note" : "stroke") && b.dataset.for !== "both";
  if (isNote) noteEl(id)?.classList.add("selected");
  renderSel();
}

function deselect() {
  if (!sel) return;
  if (sel.type === "note") noteEl(sel.id)?.classList.remove("selected");
  if (sel.type === "stroke") { inkPathEl(sel.id)?.removeAttribute("transform"); }
  sel = null;
  document.body.classList.remove("selecting");
  $("#selBar").hidden = true;
  $("#sel").hidden = true;
}

function renderSel() {
  const box = $("#sel");
  if (!sel) { box.hidden = true; return; }
  let x, y, w, h, tf;
  if (sel.type === "note") {
    const n = state.notes.get(sel.id), el = noteEl(sel.id);
    if (!n || !el) return deselect();
    w = el.offsetWidth; h = el.offsetHeight; x = n.x; y = n.y;
    tf = `rotate(${n.rot || 0}deg) scale(${n.scale || 1})`;
    box.style.setProperty("--k", 1 / (state.view.s * (n.scale || 1)));
  } else {
    const s = state.strokes.get(sel.id);
    if (!s) return deselect();
    const b = strokeBox(s), p = sel.pv;
    ({ x, y, w, h } = b);
    tf = `translate(${p.dx}px, ${p.dy}px) rotate(${p.rot}deg) scale(${p.sc})`;
    box.style.setProperty("--k", 1 / (state.view.s * p.sc));
  }
  Object.assign(box.style, { left: x + "px", top: y + "px", width: w + "px", height: h + "px", transform: tf });
  box.hidden = false;
}

function selCenter() {
  if (sel.type === "note") {
    const n = state.notes.get(sel.id), el = noteEl(sel.id);
    return { x: n.x + el.offsetWidth / 2, y: n.y + el.offsetHeight / 2 };
  }
  const b = strokeBox(state.strokes.get(sel.id));
  return { x: b.x + b.w / 2 + sel.pv.dx, y: b.y + b.h / 2 + sel.pv.dy };
}

function beginTransform(e) {
  const c = selCenter();
  if (sel.type === "note") {
    const n = state.notes.get(sel.id);
    sel.t0 = { sc: n.scale || 1, rot: n.rot || 0 };
    state.dragId = n.id;
  } else sel.t0 = { sc: sel.pv.sc, rot: sel.pv.rot };
  if (e) {
    const w = toWorld(e.clientX, e.clientY);
    sel.t0.c = c; sel.t0.d = Math.hypot(w.x - c.x, w.y - c.y) || 1; sel.t0.a = Math.atan2(w.y - c.y, w.x - c.x);
  }
}

function moveTransform(e) {
  const w = toWorld(e.clientX, e.clientY), c = sel.t0.c;
  if (gest.type === "resize") applyTransform(Math.hypot(w.x - c.x, w.y - c.y) / sel.t0.d, 0);
  else applyTransform(1, (Math.atan2(w.y - c.y, w.x - c.x) - sel.t0.a) * 180 / Math.PI);
}

const snapAngle = (deg) => { const r = ((deg % 360) + 360) % 360; for (const t of [0, 90, 180, 270, 360]) if (Math.abs(r - t) < 5) return deg - r + t; return deg; };

function applyTransform(k, dRot) {
  const sc = Math.min(4, Math.max(0.3, sel.t0.sc * k));
  const rot = Math.round(snapAngle(sel.t0.rot + dRot) * 10) / 10;
  if (sel.type === "note") {
    const n = state.notes.get(sel.id), el = noteEl(sel.id); if (!n || !el) return;
    n.scale = Math.round(sc * 100) / 100; n.rot = rot;
    el.style.transform = noteTransform(n);
    renderSel();
  } else { sel.pv.sc = sc; sel.pv.rot = rot; previewStroke(); }
}

function startStrokeDrag() { gest.type = "sdrag"; sel.pv.dx0 = sel.pv.dx; sel.pv.dy0 = sel.pv.dy; }

function previewStroke() {
  const s = state.strokes.get(sel.id); if (!s) return;
  const b = strokeBox(s), cx = b.x + b.w / 2, cy = b.y + b.h / 2, p = sel.pv;
  inkPathEl(s.id)?.setAttribute("transform", `translate(${cx + p.dx} ${cy + p.dy}) rotate(${p.rot}) scale(${p.sc * p.fx} ${p.sc * p.fy}) translate(${-cx} ${-cy})`);
  renderSel();
}

async function commitTransform() {
  if (!sel) return;
  if (sel.type === "note") {
    const n = state.notes.get(sel.id); if (!n) return;
    const prev = sel.t0 || {};
    try { await api.updateNote(n.id, { scale: n.scale || 1, rot: n.rot || 0 }); }
    catch (e) { n.scale = prev.sc; n.rot = prev.rot; const el = noteEl(n.id); if (el) placeNote(el, n); editError(e); }
    setTimeout(() => { if (state.dragId === n.id) state.dragId = null; }, 600);
  } else await bakeStroke();
}

// lines are saved with the move/size/turn/flip baked into their points
async function bakeStroke() {
  const s = state.strokes.get(sel.id); if (!s) return;
  const p = sel.pv;
  if (!p.dx && !p.dy && p.sc === 1 && !p.rot && p.fx === 1 && p.fy === 1) return;
  const b = strokeBox(s), cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  const rad = p.rot * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
  const points = s.points.map(([x, y]) => {
    const lx = (x - cx) * p.sc * p.fx, ly = (y - cy) * p.sc * p.fy;
    return [+(cx + p.dx + lx * cos - ly * sin).toFixed(1), +(cy + p.dy + lx * sin + ly * cos).toFixed(1)];
  });
  const old = { points: s.points, width: s.width };
  s.points = points; s.width = +(s.width * p.sc).toFixed(2);
  sel.pv = { dx: 0, dy: 0, sc: 1, rot: 0, fx: 1, fy: 1 };
  inkPathEl(s.id)?.removeAttribute("transform");
  drawInk(s); renderSel();
  try { await api.updateStroke(s.id, { points: s.points, width: s.width }); }
  catch (e) { Object.assign(s, old); drawInk(s); renderSel(); /schema|policy|permission/i.test(e.message || "") ? toast("Changing lines needs upgrade-v5.sql in Supabase", 4000) : toast("Couldn't save that change"); }
}

function editError(e) {
  const m = e?.message || "";
  if (/Only the person/i.test(m)) toast("Only the person who made this, or the board owner, can change it", 4000);
  else if (/column|schema cache|scale/i.test(m)) toast("Resizing and flipping need upgrade-v5.sql in Supabase", 4000);
  else toast("Couldn't save that change");
}

async function selRotate(deg) {
  if (!sel) return;
  if (sel.type === "note") { beginTransform(null); applyTransform(1, deg); return commitTransform(); }
  sel.pv.rot += deg; previewStroke(); bakeStroke();
}

async function selFlip(axis) {
  if (!sel) return;
  if (sel.type === "stroke") { sel.pv[axis === "x" ? "fx" : "fy"] *= -1; previewStroke(); return bakeStroke(); }
  const n = state.notes.get(sel.id), el = noteEl(sel.id); if (!n || !el) return;
  const k = axis === "x" ? "flip_x" : "flip_y";
  n[k] = !n[k]; placeNote(el, n);
  try { await api.updateNote(n.id, { [k]: n[k] }); } catch (e) { n[k] = !n[k]; placeNote(el, n); editError(e); }
}

async function selReset() {
  if (!sel || sel.type !== "note") return;
  const n = state.notes.get(sel.id), el = noteEl(sel.id); if (!n || !el) return;
  const prev = { scale: n.scale, rot: n.rot, flip_x: n.flip_x, flip_y: n.flip_y };
  Object.assign(n, { scale: 1, rot: 0, flip_x: false, flip_y: false }); placeNote(el, n);
  try { await api.updateNote(n.id, { scale: 1, rot: 0, flip_x: false, flip_y: false }); }
  catch (e) { Object.assign(n, prev); placeNote(el, n); editError(e); }
}

function selDeleteStroke() {
  if (sel?.type !== "stroke") return;
  const s = state.strokes.get(sel.id); deselect(); if (!s) return;
  removeInk(s.id);
  api.deleteStroke(s.id).catch(() => { addInk(s); toast("Couldn't delete that line"); });
}

// ---------------------------------------------------------------- edit sheet
let editId = null, editPhoto = null, editColor = "c1";
function openEdit(id) {
  const n = state.notes.get(id); if (!n) return;
  if (!canEdit(n)) return toast("Only the person who made this, or the board owner, can change it");
  if (n.kind === "link") return toast("Link cards can be resized, rotated and flipped, but not edited");
  editId = id; editPhoto = null; editColor = n.color || "c1";
  for (const s of document.querySelectorAll("#edit [data-kinds]")) s.hidden = !s.dataset.kinds.split(" ").includes(n.kind);
  $("#eText").value = n.kind === "text" ? n.body || "" : "";
  $("#eEmoji").value = n.kind === "emoji" ? n.body || "" : "";
  $("#eCap").value = n.kind === "image" ? n.body || "" : "";
  $("#ePhotoName").textContent = "";
  if (n.kind === "countdown") {
    const t = new Date(n.meta?.target || Date.now());
    $("#eCdTitle").value = n.meta?.title || "";
    $("#eCdDate").value = localDateKey(t);
    $("#eCdTime").value = n.meta?.allDay ? "" : `${pad2(t.getHours())}:${pad2(t.getMinutes())}`;
  }
  swatchRow($("#eSwatches"), editColor, (c) => (editColor = c));
  $("#editTitle").textContent = { text: "Edit note", emoji: "Change emoji", image: "Edit photo", drawing: "Edit drawing", voice: "Edit voice note", countdown: "Edit countdown" }[n.kind] || "Edit";
  openSheet("edit");
}

async function saveEdit() {
  const n = state.notes.get(editId); if (!n) return closeSheet("edit");
  const patch = {};
  if (["text", "drawing", "voice", "countdown"].includes(n.kind) && editColor !== n.color) patch.color = editColor;
  if (n.kind === "text") { const b = $("#eText").value.trim(); if (!b) return toast("A note can't be empty"); if (b !== n.body) patch.body = b; }
  if (n.kind === "emoji") { const b = $("#eEmoji").value.trim().slice(0, 8); if (!b) return toast("Pick an emoji"); if (b !== n.body) patch.body = b; }
  if (n.kind === "image") { const c = $("#eCap").value.trim() || null; if (c !== (n.body || null)) patch.body = c; }
  if (n.kind === "countdown") {
    const date = $("#eCdDate").value, time = $("#eCdTime").value, title = $("#eCdTitle").value.trim();
    if (!date || !title) return toast("A countdown needs a name and a date");
    const target = new Date(`${date}T${time || "00:00"}`);
    patch.meta = { ...n.meta, target: target.toISOString(), allDay: !time, title }; patch.body = title;
  }
  const btn = $("#eSave"); busy(btn, true, "Saving…");
  const oldPath = n.media_path;
  try {
    if (n.kind === "image" && editPhoto) {
      patch.media_path = await api.uploadMedia(state.board.id, editPhoto, "jpg");
      state.urls[patch.media_path] = URL.createObjectURL(editPhoto);
    }
    if (Object.keys(patch).length) {
      const before = {}; for (const k of Object.keys(patch)) before[k] = n[k];
      await api.updateNote(n.id, patch);
      await upsertNote({ ...n, ...patch });
      if (patch.media_path && oldPath) api.deleteMedia(oldPath);
      if (!patch.media_path) pushHist({ label: "edit", undo: () => editNoteTo(n.id, before), redo: () => editNoteTo(n.id, patch) });
    }
    closeSheet("edit");
    toast("Saved");
  } catch (e) { editError(e); }
  busy(btn, false);
}

// ---------------------------------------------------------------- live cursors
let curSendT = 0, curHidden = true;
function sendCursor(e) {
  if (!live || !state.me) return;
  if (!e) { if (!curHidden) { curHidden = true; live.send({ t: "cur", u: state.me.id, hide: true }); } return; }
  const now = Date.now();
  if (now - curSendT < 100) return;
  if (e.pointerType !== "mouse" && !pointers.has(e.pointerId)) return;
  curSendT = now; curHidden = false;
  const w = toWorld(e.clientX, e.clientY);
  live.send({ t: "cur", u: state.me.id, x: Math.round(w.x), y: Math.round(w.y), touch: e.pointerType !== "mouse" });
}

function placeCursor(el) {
  const c = state.cursors.get(el.dataset.u); if (!c) return;
  el.style.transform = `translate(${c.x}px, ${c.y}px) scale(${1 / state.view.s})`;
}

function onCursor(m) {
  if (!m.u || m.u === state.me?.id) return;
  const box = $("#cursors");
  let el = box.querySelector(`.cursor[data-u="${CSS.escape(m.u)}"]`);
  if (m.hide) { el?.remove(); const c = state.cursors.get(m.u); if (c) c.hidden = true; return; }
  const mem = memberById(m.u); if (!mem) return;
  const prev = state.cursors.get(m.u);
  state.cursors.set(m.u, { x: m.x, y: m.y, at: Date.now(), touch: m.touch });
  if (!el) {
    el = document.createElement("div"); el.className = "cursor"; el.dataset.u = m.u;
    const col = BRIGHT[mem.color] || BRIGHT.c1;
    el.style.setProperty("--c", col);
    el.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24"><path d="M3 2l7.5 19 2.6-7.9L21 10.5z" fill="${col}" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg><span></span>`;
    el.querySelector("span").textContent = mem.name;
    el.querySelector("span").style.background = col;
    box.appendChild(el);
  }
  el.classList.toggle("touch", !!m.touch);
  placeCursor(el);
  if (!prev || Date.now() - prev.at > 15000) renderChips();
}

function expireCursors() {
  for (const [u, c] of state.cursors) {
    if (Date.now() - c.at > 6000) document.querySelector(`#cursors .cursor[data-u="${CSS.escape(u)}"]`)?.remove();
  }
  if (!$("#people").hidden) renderPeople();
}

// ---------------------------------------------------------------- drawing on the board (vector ink)
let inkMode = false, inkCur = null, inkSendT = 0, inkSent = 0;
let shapeDrag = null;   // the shape being dragged out: { name, a }
const inkTool = {
  color: PENS[0], size: SIZES[1], erasing: false,
  tool: "draw",        // draw | eyedrop | fill | text | shape
  shape: "rect",
  brush: "pen",        // pen | marker | hi
  tools() { return { color: this.color, size: this.size, erasing: this.erasing }; },
  setColor(c) { this.color = c; this.erasing = false; if (this.tool === "eyedrop") this.tool = "draw"; },
  setSize(s) { this.size = s; }, toggleEraser() { this.erasing = !this.erasing; },
};
// brush looks: marker is a bit wider and see-through, highlighter is wide and very see-through.
// The look is stored in the stroke's own color (hex with alpha), so no extra column is needed.
const BRUSH = { pen: { w: 1, a: "" }, marker: { w: 2.2, a: "cc" }, hi: { w: 4, a: "66" } };
const clampW = (v) => +Math.min(400, Math.max(0.5, v)).toFixed(2);
const SVGNS = "http://www.w3.org/2000/svg";

// ---- shapes: drawn as ordinary pen strokes, so they save, undo, erase and show for the other person with no database change
// corners are doubled so inkD's smoothing keeps them sharp
function shapePoints(name, a, b) {
  const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x), y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y);
  const w = x1 - x0, h = y1 - y0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = w / 2, ry = h / 2;
  const P = (x, y) => [+x.toFixed(1), +y.toFixed(1)];
  const ring = (n) => Array.from({ length: n }, (_, k) => { const t = -Math.PI / 2 + (k * 2 * Math.PI) / n; return P(cx + rx * Math.cos(t), cy + ry * Math.sin(t)); });
  const sharp = (vs, close) => { const out = []; vs.forEach((v) => out.push(v, v)); if (close) out.push(vs[0], vs[0]); return out; };
  switch (name) {
    case "line": return [P(a.x, a.y), P(b.x, b.y)];
    case "arrow": {
      const len = Math.hypot(b.x - a.x, b.y - a.y); if (len < 1) return [];
      const t = Math.atan2(b.y - a.y, b.x - a.x), hl = Math.min(30, Math.max(8, len * 0.25));
      const h1 = P(b.x - hl * Math.cos(t - 0.45), b.y - hl * Math.sin(t - 0.45));
      const h2 = P(b.x - hl * Math.cos(t + 0.45), b.y - hl * Math.sin(t + 0.45));
      return sharp([P(a.x, a.y), P(b.x, b.y), h1, P(b.x, b.y), h2], false);
    }
    case "rect": return sharp([P(x0, y0), P(x1, y0), P(x1, y1), P(x0, y1)], true);
    case "round": {
      const r = Math.min(w, h) * 0.2, pts = [];
      const arcs = [[x0 + r, y0 + r, Math.PI], [x1 - r, y0 + r, -Math.PI / 2], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, Math.PI / 2]];
      for (const [ax, ay, st] of arcs) for (let k = 0; k <= 6; k++) { const t = st + (k * Math.PI / 2) / 6; pts.push(P(ax + r * Math.cos(t), ay + r * Math.sin(t))); }
      return sharp(pts, true);
    }
    case "oval": { const r = ring(72); return [...r, r[0]]; }
    case "tri": return sharp([P(cx, y0), P(x1, y1), P(x0, y1)], true);
    case "rtri": return sharp([P(x0, y0), P(x0, y1), P(x1, y1)], true);
    case "diamond": return sharp([P(cx, y0), P(x1, cy), P(cx, y1), P(x0, cy)], true);
    case "pent": return sharp(ring(5), true);
    case "hex": return sharp(ring(6), true);
    case "star": return sharp(Array.from({ length: 10 }, (_, k) => { const t = -Math.PI / 2 + (k * Math.PI) / 5, f = k % 2 ? 0.45 : 1; return P(cx + rx * f * Math.cos(t), cy + ry * f * Math.sin(t)); }), true);
    case "callout": {   // rectangular speech bubble with a tail at the bottom left
      const bh = h * 0.75, by = y0 + bh;
      return sharp([P(x0, y0), P(x1, y0), P(x1, by), P(x0 + w * 0.35, by), P(x0 + w * 0.15, y1), P(x0 + w * 0.2, by), P(x0, by)], true);
    }
    case "oval-callout": {   // oval speech bubble with a tail at the bottom left
      const ob = y0 + h * 0.75, ocy = (y0 + ob) / 2, ory = (ob - y0) / 2;
      const r = Array.from({ length: 72 }, (_, k) => { const t = -Math.PI / 2 + (k * 2 * Math.PI) / 72; return P(cx + rx * Math.cos(t), ocy + ory * Math.sin(t)); });
      const tip = P(x0 + w * 0.18, y1);
      return [...r.slice(0, 39), tip, ...r.slice(41), r[0]];
    }
    case "cloud": {   // cloud thought bubble
      const pts = Array.from({ length: 64 }, (_, k) => { const t = (k * 2 * Math.PI) / 64, f = 1 + 0.13 * Math.cos(9 * t); return P(cx + rx * 0.95 * f * Math.cos(t), cy + ry * 0.95 * f * Math.sin(t)); });
      return [...pts, pts[0]];
    }
    case "heart": {
      const raw = Array.from({ length: 80 }, (_, k) => { const t = (k / 80) * 2 * Math.PI; return [16 * Math.sin(t) ** 3, 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)]; });
      const maxY = Math.max(...raw.map((p) => p[1])), minY = Math.min(...raw.map((p) => p[1]));
      const pts = raw.map(([u, v]) => P(x0 + ((u + 16) / 32) * w, y0 + ((maxY - v) / (maxY - minY)) * h));
      return [...pts, pts[0]];
    }
    default: return [];
  }
}

function inkD(p) {
  if (!p.length) return "";
  if (p.length === 1) return `M${p[0][0]} ${p[0][1]}l0.01 0`;
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 1; i < p.length - 1; i++) {
    const mx = ((p[i][0] + p[i + 1][0]) / 2).toFixed(1), my = ((p[i][1] + p[i + 1][1]) / 2).toFixed(1);
    d += `Q${p[i][0]} ${p[i][1]} ${mx} ${my}`;
  }
  const l = p[p.length - 1];
  return d + `L${l[0]} ${l[1]}`;
}

function inkPathEl(id) { return document.querySelector(`#ink [data-id="${CSS.escape(id)}"]`); }

function drawInk(row, live_ = false) {
  const kind = row.kind || "ink";
  let el = inkPathEl(row.id);
  if (el && el.tagName.toLowerCase() !== (kind === "text" ? "text" : "path")) { el.remove(); el = null; }
  if (!el) {
    el = document.createElementNS(SVGNS, kind === "text" ? "text" : "path");
    el.dataset.id = row.id;
    if (kind === "fill") $("#ink").prepend(el); else $("#ink").appendChild(el);   // fills sit under the lines
  }
  if (kind === "text") {
    el.setAttribute("x", row.points[0][0]); el.setAttribute("y", row.points[0][1]);
    el.setAttribute("font-size", row.width); el.style.fill = row.color; el.textContent = row.label || "";
  } else if (kind === "fill") {
    el.setAttribute("d", inkD(row.points) + "Z"); el.style.fill = row.color; el.style.stroke = "none";
  } else {
    el.setAttribute("d", inkD(row.points));
    el.setAttribute("stroke", row.color);
    el.setAttribute("stroke-width", row.width);
  }
  el.classList.toggle("live", live_);
}

function addInk(row) { state.strokes.set(row.id, row); drawInk(row); }
function removeInk(id) { state.strokes.delete(id); inkPathEl(id)?.remove(); }

function onStrokeEvent(row, deleted) {
  if (deleted) { if (sel?.id === row.id) deselect(); return removeInk(row.id); }
  if (sel?.id === row.id && gest) return;   // you're mid-change on it
  addInk(row);
  if (sel?.id === row.id) renderSel();
}

function setInkMode(on) {
  if (on) { deselect(); inkTool.tool = "draw"; inkTool.erasing = false; }
  inkMode = on;
  document.body.classList.toggle("drawmode", on);
  $("#drawBar").hidden = !on;
  $("#shapeMenu").hidden = true;
  $("#toolDraw").setAttribute("aria-pressed", String(on));
  syncBoardUI();
  $("#scroller").classList.toggle("drawing", on);
  if (on && !state.v2 && !isDemo) toast("Drawing on the board needs the latest database update (upgrade-v4.sql)", 4000);
}

function inkStart(e) {
  if (inkTool.erasing) { inkCur = { erase: true }; inkEraseAt(e); return; }
  const w = toWorld(e.clientX, e.clientY);
  if (inkTool.tool === "eyedrop") return pickAt(w);
  if (inkTool.tool === "fill") return fillAt(w);
  if (inkTool.tool === "text") return openTextAt(e, w);
  if (inkTool.tool === "shape") {
    shapeDrag = { name: inkTool.shape, a: { x: w.x, y: w.y } };
    inkCur = { id: uid(), board_id: state.board.id, author_id: state.me.id, kind: "ink", color: inkTool.color, width: clampW(inkTool.size * 2 / state.view.s), points: [] };
    return;
  }
  const b = BRUSH[inkTool.brush] || BRUSH.pen;
  inkCur = { id: uid(), board_id: state.board.id, author_id: state.me.id, kind: "ink", color: inkTool.color + b.a, width: clampW(inkTool.size * 2 * b.w / state.view.s), points: [[+w.x.toFixed(1), +w.y.toFixed(1)]] };
  inkSent = 0;
  drawInk(inkCur, true);
}

// ---- palette helpers
function setBoardTool(name) { inkTool.tool = name; inkTool.erasing = false; syncBoardUI(); }
function syncBoardUI() {
  const t = inkTool;
  const map = {
    bBrushPen: t.tool === "draw" && !t.erasing && t.brush === "pen",
    bBrushMarker: t.tool === "draw" && !t.erasing && t.brush === "marker",
    bBrushHi: t.tool === "draw" && !t.erasing && t.brush === "hi",
    bEyedrop: t.tool === "eyedrop", bFill: t.tool === "fill", bText: t.tool === "text", bEraser: t.erasing, bShape: t.tool === "shape",
  };
  for (const id in map) $("#" + id)?.setAttribute("aria-pressed", String(map[id]));
  document.querySelectorAll("#bPens .pen").forEach((b) => b.setAttribute("aria-pressed", String(!t.erasing && t.tool !== "eyedrop" && b.dataset.c === t.color)));
}
function zoomCenter(f) { const r = vp(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, f); }
function schemaMsg(err) {
  return /kind|label|schema cache|does not exist|Could not find/i.test(err?.message || "") ? "Fill and text need upgrade-v11.sql in Supabase" : "Couldn't save that";
}
// eyedropper: copy the color of the line under your finger
function pickAt(w) {
  const r = 10 / state.view.s;
  let best = null;
  for (const s of [...state.strokes.values()].reverse()) {
    if ((s.kind || "ink") !== "ink") continue;
    const tol = r + s.width / 2;
    if (s.points.some(([x, y]) => Math.hypot(x - w.x, y - w.y) < tol)) { best = s; break; }
  }
  if (!best) return toast("No line there. Tap a line to copy its color.");
  inkTool.color = best.color.slice(0, 7);
  setBoardTool("draw");
  toast("Color picked");
}
// fill bucket: tap inside a closed loop of your ink
function pointInPoly(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function closedShape(s) {
  if ((s.kind || "ink") !== "ink" || s._live || s.points.length < 6) return false;
  const a = s.points[0], b = s.points[s.points.length - 1];
  return Math.hypot(a[0] - b[0], a[1] - b[1]) <= Math.max(18, s.width * 2);
}
function fillAt(w) {
  let best = null, bestArea = Infinity;
  for (const s of state.strokes.values()) {
    if (!closedShape(s) || !pointInPoly(w.x, w.y, s.points)) continue;
    const xs = s.points.map((p) => p[0]), ys = s.points.map((p) => p[1]);
    const area = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
    if (area < bestArea) { best = s; bestArea = area; }
  }
  if (!best) return toast("Draw a closed loop first, then tap inside it");
  const color = inkTool.color + "66";
  const key = JSON.stringify(best.points);
  const existing = [...state.strokes.values()].find((s) => s.kind === "fill" && JSON.stringify(s.points) === key);
  if (existing) {
    const prev = existing.color;
    existing.color = color; drawInk(existing);
    api.updateStroke(existing.id, { color }).catch(() => { existing.color = prev; drawInk(existing); toast("Couldn't change that fill"); });
    return;
  }
  const row = { id: uid(), board_id: state.board.id, author_id: state.me.id, kind: "fill", color, width: 1, points: best.points.map((p) => [p[0], p[1]]) };
  addInk(row);
  api.addStroke(row).catch((err) => { removeInk(row.id); toast(schemaMsg(err)); });
}
// text tool: tap, type, press Enter (Esc cancels)
function openTextAt(e, w) {
  document.querySelector(".ink-text-input")?.remove();
  const input = document.createElement("input");
  input.className = "ink-text-input"; input.maxLength = 200; input.placeholder = "Type, then Enter";
  input.style.left = Math.max(8, Math.min(innerWidth - 180, e.clientX)) + "px";
  input.style.top = Math.max(8, e.clientY - 20) + "px";
  input.style.color = inkTool.color;
  let done = false;
  const finish = (save) => {
    if (done) return; done = true;
    const text = input.value.trim(); input.remove();
    if (!save || !text) return;
    const row = { id: uid(), board_id: state.board.id, author_id: state.me.id, kind: "text", label: text.slice(0, 200), color: inkTool.color, width: clampW(inkTool.size * 2.5), points: [[+w.x.toFixed(1), +w.y.toFixed(1)]] };
    addInk(row);
    api.addStroke(row).catch((err) => { removeInk(row.id); toast(schemaMsg(err)); });
  };
  input.onkeydown = (ev) => { if (ev.key === "Enter") finish(true); else if (ev.key === "Escape") finish(false); };
  input.onblur = () => finish(true);
  // taps inside the box must not reach the board (they would start another stroke)
  for (const ev of ["pointerdown", "pointerup", "touchstart", "touchend", "mousedown", "click"]) input.addEventListener(ev, (x) => x.stopPropagation());
  document.body.appendChild(input);
  setTimeout(() => input.focus(), 60);   // after the tap ends, so the board does not steal focus
}

function inkMove(e) {
  if (!inkCur) return;
  if (inkCur.erase) return inkEraseAt(e);
  const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
  const minGap = 1.5 / state.view.s;
  if (shapeDrag) {   // a shape is redrawn from its start point to the finger, not streamed
    const last = evs[evs.length - 1], w = toWorld(last.clientX, last.clientY);
    inkCur.points = shapePoints(shapeDrag.name, shapeDrag.a, w);
    drawInk(inkCur, true);
    return;
  }
  for (const ev of evs) {
    const w = toWorld(ev.clientX, ev.clientY), l = inkCur.points[inkCur.points.length - 1];
    if (Math.hypot(w.x - l[0], w.y - l[1]) >= minGap && inkCur.points.length < 3000) inkCur.points.push([+w.x.toFixed(1), +w.y.toFixed(1)]);
  }
  drawInk(inkCur, true);
  const now = Date.now();
  if (now - inkSendT > 60) {
    inkSendT = now;
    live?.send({ t: "ink", id: inkCur.id, u: state.me.id, color: inkCur.color, width: inkCur.width, from: inkSent, pts: inkCur.points.slice(inkSent) });
    inkSent = inkCur.points.length;
  }
}

async function inkEnd() {
  const s = inkCur; inkCur = null;
  const wasShape = !!shapeDrag; shapeDrag = null;
  if (!s || s.erase) return;
  if (wasShape && s.points.length < 2) { inkPathEl(s.id)?.remove(); return; }   // a tap with no drag
  drawInk(s, false);
  state.strokes.set(s.id, s);
  try { await api.addStroke(s); }
  catch (err) {
    console.warn(err); removeInk(s.id);
    live?.send({ t: "inkx", id: s.id });
    /relation|schema cache|does not exist/i.test(err.message || "") ? toast("Drawing on the board needs upgrade-v4.sql in Supabase", 4000) : toast("Couldn't save that line");
  }
}

function inkCancel() { shapeDrag = null; if (inkCur && !inkCur.erase) { inkPathEl(inkCur.id)?.remove(); live?.send({ t: "inkx", id: inkCur.id }); } inkCur = null; }

let eraseWarned = false;
function inkEraseAt(e) {
  const w = toWorld(e.clientX, e.clientY), r = 14 / state.view.s;
  for (const [id, s] of state.strokes) {
    const hit = s.points.some(([x, y]) => Math.abs(x - w.x) < r + s.width / 2 && Math.abs(y - w.y) < r + s.width / 2 && Math.hypot(x - w.x, y - w.y) < r + s.width / 2);
    if (!hit) continue;
    if (s.author_id !== state.me.id) { if (!eraseWarned) { eraseWarned = true; toast("You can only erase your own lines"); setTimeout(() => (eraseWarned = false), 4000); } continue; }
    removeInk(id);
    api.deleteStroke(id).catch(() => { addInk(s); toast("Couldn't erase that"); });
  }
}

function inkUndo() {
  const mine = [...state.strokes.values()].filter((s) => s.author_id === state.me.id);
  const last = mine[mine.length - 1];
  if (!last) return toast("Nothing of yours to undo");
  removeInk(last.id);
  api.deleteStroke(last.id).catch(() => { addInk(last); toast("Couldn't undo"); });
}

function onRemoteInk(m) {
  if (m.u === state.me?.id) return;
  let s = state.strokes.get(m.id);
  if (s && !s._live) return;           // already saved
  if (!s) {
    if (m.from !== 0) return;          // missed the start: the saved line will arrive shortly
    s = { id: m.id, author_id: m.u, color: m.color, width: m.width, points: [], _live: true };
    state.strokes.set(m.id, s);
  }
  if (m.from !== s.points.length) return;
  s.points.push(...m.pts);
  drawInk(s, true);
}

function noteEl(id) { return document.querySelector(`#board .note[data-id="${CSS.escape(id)}"]`); }

function paintPaper(el, c) {
  c = c || "c1";
  el.style.setProperty("--paper", `var(--n${c.slice(1)})`);
  el.style.setProperty("--paper-bright", BRIGHT[c]);
  el.style.setProperty("--strip", BRIGHT[c]);
}

function hashNum(s, i) { let h = 2166136261; for (const ch of s + i) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return (h >>> 0) / 4294967295; }
const fmtDur = (s) => `${Math.floor(s / 60)}:${pad2(Math.round(s % 60))}`;

function countdownParts(meta) {
  const t = new Date(meta?.target || Date.now()).getTime();
  const ms = t - Date.now(); const title = meta?.title || "";
  const plural = (n, one, many) => `${n === 1 ? one : many}`;
  if (ms > 0) {
    if (meta?.allDay || ms >= 864e5) {
      const d = meta?.allDay ? Math.ceil(ms / 864e5) : Math.floor(ms / 864e5);
      return { big: d, unit: plural(d, "day until", "days until"), title };
    }
    const h = Math.floor(ms / 36e5);
    if (h >= 1) return { big: h, unit: plural(h, "hour until", "hours until"), title };
    const m = Math.max(1, Math.ceil(ms / 6e4));
    return { big: m, unit: plural(m, "minute until", "minutes until"), title };
  }
  const since = -ms / 864e5;
  if (since < 1) return { big: "🎉", unit: "it's here!", title };
  const d = Math.floor(since);
  return { big: d, unit: plural(d, "day since", "days since"), title };
}

function buildNoteContent(n, el) {
  el.className = "note " + n.kind + (n.kind === "text" || n.kind === "list" ? " paper" : "");
  paintPaper(el, n.color);
  el.innerHTML = "";
  if (n.kind === "text") {
    const b = document.createElement("div"); b.className = "body"; b.textContent = n.body || ""; el.appendChild(b);
  } else if (n.kind === "emoji") {
    el.appendChild(document.createTextNode(n.body || "❤️"));
  } else if (n.kind === "image" || n.kind === "drawing") {
    const img = document.createElement("img"); img.alt = n.kind === "image" ? (n.body || "Photo") : "Drawing"; img.draggable = false;
    if (state.urls[n.media_path]) img.src = state.urls[n.media_path];
    el.appendChild(img);
    if (n.kind === "image" && n.body) { const c = document.createElement("div"); c.className = "cap"; c.textContent = n.body; el.appendChild(c); }
  } else if (n.kind === "voice") {
    const row = document.createElement("div"); row.className = "vrow";
    row.innerHTML = `<div class="play">▶</div><div class="wave"></div>`;
    const wave = row.querySelector(".wave");
    for (let i = 0; i < 16; i++) { const b = document.createElement("i"); b.style.height = 6 + hashNum(n.id, i) * 24 + "px"; wave.appendChild(b); }
    el.appendChild(row);
    const d = document.createElement("div"); d.className = "dur"; d.textContent = "Voice note · " + fmtDur(n.meta?.duration || 0); el.appendChild(d);
  } else if (n.kind === "link") {
    buildLinkCard(n, el);
  } else if (n.kind === "list") {
    buildListContent(n, el);
  } else if (n.kind === "countdown") {
    const p = countdownParts(n.meta);
    el.innerHTML = `<div class="cd-big"></div><div class="cd-unit"></div><div class="cd-title"></div>`;
    el.querySelector(".cd-big").textContent = p.big;
    el.querySelector(".cd-unit").textContent = p.unit;
    el.querySelector(".cd-title").textContent = p.title;
  }
  const from = document.createElement("div"); from.className = "from"; el.appendChild(from);
  decorate(el, n);
}

// author label, seen tick, schedule time, pin, reaction and reply badges
function decorate(el, n) {
  const who = memberById(n.author_id);
  el.style.setProperty("--who", BRIGHT[who?.color] || BRIGHT.c1);
  el.classList.toggle("pinned", !!n.pinned);
  el.classList.toggle("pending", !!n._pending);
  const sched = isScheduled(n);
  el.classList.toggle("scheduled", sched);
  el.querySelector(".badges")?.remove();
  el.querySelector(".pinmark")?.remove();
  const f = el.querySelector(".from");
  if (f) {
    f.classList.remove("seen");
    if (n.author_id !== state.me?.id) f.textContent = who?.name || "";
    else if (sched) f.textContent = "⏰ " + fmtWhen(n.show_at);
    else if (n.seen_at) { f.textContent = "✓ Seen"; f.classList.add("seen"); }
    else f.textContent = "";
  }
  if (n.pinned) { const p = document.createElement("div"); p.className = "pinmark"; p.textContent = "📌"; el.appendChild(p); }
  const rs = state.reactions.get(n.id) || [], reps = state.replies.get(n.id) || [];
  if (rs.length || reps.length) {
    const b = document.createElement("div"); b.className = "badges";
    if (rs.length) {
      const s = document.createElement("span"); s.className = "badge";
      s.textContent = [...new Set(rs.map((r) => r.emoji))].slice(0, 3).join("") + (rs.length > 1 ? " " + rs.length : "");
      b.appendChild(s);
    }
    if (reps.length) { const s = document.createElement("span"); s.className = "badge"; s.textContent = "💬 " + reps.length; b.appendChild(s); }
    el.appendChild(b);
  }
}

function redecorate(id) { const n = state.notes.get(id), el = noteEl(id); if (n && el) decorate(el, n); }

function noteTransform(n, extra = "") {
  const s = n.scale || 1;
  return `rotate(${n.rot || 0}deg) scale(${s * (n.flip_x ? -1 : 1)}, ${s * (n.flip_y ? -1 : 1)}) ${extra}`.trim();
}

function placeNote(el, n) {
  el.style.left = n.x + "px";
  el.style.top = n.y + "px";
  const base = Math.max(1, Math.floor((n.z || 0) / 1000) % 1000000000);
  el.style.zIndex = String(n.pinned ? 1000000000 + base : base);
  el.style.transform = noteTransform(n);
  if (sel?.type === "note" && sel.id === n.id) renderSel();
}

async function upsertNote(n, fromRealtime = false) {
  const existed = state.notes.has(n.id);
  const prev = state.notes.get(n.id);
  state.notes.set(n.id, { ...prev, ...n });
  n = state.notes.get(n.id);
  if (n.media_path && !state.urls[n.media_path]) await loadUrls([n]);
  let el = noteEl(n.id);
  if (!el) {
    el = document.createElement("div");
    el.dataset.id = n.id;
    buildNoteContent(n, el);
    $("#board").appendChild(el);
  } else if (!prev || prev.body !== n.body || prev.color !== n.color || prev.media_path !== n.media_path || JSON.stringify(prev.meta) !== JSON.stringify(n.meta)) {
    buildNoteContent(n, el);
  } else decorate(el, n);
  placeNote(el, n);
  const isPartner = n.author_id !== state.me?.id;
  if (isPartner && new Date(n.show_at || n.created_at).getTime() > state.lastSeen) el.classList.add("fresh");
  if (fromRealtime && !existed && isPartner) {
    toast(`New note from ${memberById(n.author_id)?.name || "your person"}`);
    if (isDemo && document.hidden) localNotify(`New note from ${memberById(n.author_id)?.name || "your person"}`);
  }
  if (detailId === n.id) renderDetailMeta(n);
  if (sel?.id === n.id) renderSel();
  updateEmpty();
}

function removeNoteEl(id) {
  if (sel?.id === id) deselect();
  state.notes.delete(id);
  noteEl(id)?.remove();
  if (detailId === id) closeSheet("detail");
  updateEmpty();
}

function updateEmpty() { $("#emptyState").hidden = state.notes.size > 0; }

function markSeen() {
  state.lastSeen = Date.now(); ls.set("soy-last-seen", state.lastSeen);
  setTimeout(() => document.querySelectorAll(".note.fresh").forEach((e) => e.classList.remove("fresh")), 5000);
}

// tell the other person their notes have been seen
let seenTimer = null;
function markPartnerSeen(delay = 1200) {
  clearTimeout(seenTimer);
  seenTimer = setTimeout(async () => {
    if (document.visibilityState !== "visible") return;
    const ids = [...state.notes.values()].filter((n) => n.author_id !== state.me?.id && !n.seen_at && !isScheduled(n)).map((n) => n.id);
    if (!ids.length) return;
    try { await api.markSeen(ids); ids.forEach((id) => { const n = state.notes.get(id); if (n) n.seen_at = new Date().toISOString(); }); } catch { /* column missing until v2 */ }
  }, delay);
}

function tickNotes() {
  for (const n of state.notes.values()) {
    const el = noteEl(n.id); if (!el) continue;
    if (n.kind === "countdown") buildNoteContent(n, el);
    else if (n.show_at) decorate(el, n);
  }
}

// ---------------------------------------------------------------- sheets
function openSheet(name) { $("#" + name).hidden = false; $("#" + name + "Backdrop").hidden = false; }

// ---- Games: single-player games in games/<slug>/index.html, opened in a full-screen panel ----
const GAMES = [
  { slug: "quick-draw", icon: "🔫", name: "Quick Draw", blurb: "Shoot when it turns green" },
  { slug: "tower-tap", icon: "🏗️", name: "Tower Tap", blurb: "Stack blocks as high as you can" },
  { slug: "tetra-stack", icon: "🧱", name: "Tetra Stack", blurb: "Fill rows with falling blocks" },
  { slug: "four-feud", icon: "🔴", name: "Four Feud", blurb: "Connect four against the computer" },
  { slug: "box-claim", icon: "📦", name: "Box Claim", blurb: "Claim boxes with lines" },
  { slug: "word-gallows", icon: "🔤", name: "Word Gallows", blurb: "Guess the hidden word" },
  { slug: "bullseye-drop", icon: "🎯", name: "Bullseye Drop", blurb: "Drop the pin on the bullseye" },
  { slug: "matrix-flap", icon: "🐦", name: "Matrix Flap", blurb: "Flap through the green pipes" },
  { slug: "paper-glide", icon: "✈️", name: "Paper Glide", blurb: "Glide through the pin boards" },
  { slug: "lantern-hop", icon: "🏮", name: "Lantern Hop", blurb: "Hop stone to stone" },
  { slug: "neon-kestrel", icon: "🌃", name: "Neon Kestrel", blurb: "Endless neon flyer" },
  { slug: "parry-brawl", icon: "⚔️", name: "Parry Brawl", blurb: "Platform fights vs the CPU, with parries" },
];
let gsPlaying = null;        // game open in the iframe
let gsMode = "games";        // games | play | scores | board
let gsBoardGame = null;      // game whose board is open in the Scores tab
let scoresData = [];         // every saved score for this board
const PENDING_KEY = "pinned.scores.pending";

function el(tag, cls, text) { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

function renderGames() {
  const list = $("#gsList");
  if (list.childElementCount) return;
  for (const g of GAMES) {
    const b = el("button", "gs-card");
    b.append(el("i", "gs-ic", g.icon), el("b", null, g.name), el("span", null, g.blurb));
    b.onclick = () => playGame(g);
    list.appendChild(b);
  }
}
function setGsTabs(on) {
  $("#gsTabs").hidden = !on;
  $("#gsTabGames").classList.toggle("on", on === "games");
  $("#gsTabScores").classList.toggle("on", on === "scores");
}
function showGamesList() {
  gsMode = "games"; gsPlaying = null;
  $("#gsFrame").src = "about:blank";          // stops the game and its sound
  $("#gsPlay").hidden = true; $("#gsScores").hidden = true; $("#gsList").hidden = false;
  setGsTabs("games"); $("#gsTitle").textContent = "Games";
}
function showScoresList() {
  gsMode = "scores"; gsBoardGame = null; gsPlaying = null;
  $("#gsFrame").src = "about:blank";
  $("#gsPlay").hidden = true; $("#gsList").hidden = true; $("#gsScores").hidden = false;
  setGsTabs("scores"); $("#gsTitle").textContent = "Scores";
  renderScores(); loadScores();
}
function openGames() { renderGames(); showGamesList(); $("#gamesScreen").hidden = false; }
function closeGames() { gsMode = "games"; $("#gsFrame").src = "about:blank"; $("#gamesScreen").hidden = true; }
function playGame(g) {
  gsMode = "play"; gsPlaying = g;
  $("#gsList").hidden = true; $("#gsScores").hidden = true; $("#gsPlay").hidden = false;
  setGsTabs(null); $("#gsTitle").textContent = g.name;
  $("#gsFrame").src = `games/${g.slug}/index.html`;
}
function backFromGames() {
  if (gsMode === "play") return showGamesList();
  if (gsMode === "board") return showScoresList();
  closeGames();
}

// ---- Scores: each person's best run per game, shared by everyone on the board ----
function scoreAvatar(m) {
  const a = el("span", "sc-av");
  const url = m && m.avatar_path && state.urls[m.avatar_path];
  a.style.background = BRIGHT[m && m.color] || BRIGHT.c1;
  if (url) a.style.backgroundImage = `url("${url}")`;
  else a.textContent = ((m && m.name) || "?").slice(0, 1).toUpperCase();
  return a;
}
function scoreName(id) {
  if (state.me && id === state.me.id) return "You";
  const m = memberById(id);
  return m ? m.name : "Someone";
}
// best run per person for one game, highest first
function bestRows(slug) {
  const best = new Map();
  for (const r of scoresData) {
    if (r.game !== slug) continue;
    const cur = best.get(r.user_id);
    if (!cur || r.score > cur.score) best.set(r.user_id, { user_id: r.user_id, score: r.score, at: r.created_at });
  }
  return [...best.values()].sort((a, b) => b.score - a.score);
}
function renderScores() {
  const wrap = $("#gsScores");
  wrap.innerHTML = "";
  if (gsMode === "board" && gsBoardGame) return renderBoard(wrap, gsBoardGame);
  for (const g of GAMES) {
    const rows = bestRows(g.slug);
    const top = rows[0];
    const mine = rows.find((r) => state.me && r.user_id === state.me.id);
    const row = el("button", "sc-row");
    const info = el("span", "sc-name");
    info.append(el("b", null, g.name), el("small", null, top ? `${scoreName(top.user_id)} leads · You ${mine ? mine.score : "—"}` : "No scores yet"));
    const lead = el("span", "sc-lead");
    if (top) lead.append(scoreAvatar(memberById(top.user_id)), el("span", null, String(top.score)));
    else lead.append(el("span", null, "—"));
    row.append(el("i", "gs-ic", g.icon), info, lead);
    row.onclick = () => openScoreBoard(g);
    wrap.appendChild(row);
  }
}
function openScoreBoard(g) { gsMode = "board"; gsBoardGame = g; $("#gsTitle").textContent = g.name; renderScores(); }
function renderBoard(wrap, g) {
  const back = el("button", "sc-back", "‹ All scores");
  back.onclick = () => { gsMode = "scores"; gsBoardGame = null; $("#gsTitle").textContent = "Scores"; renderScores(); };
  wrap.appendChild(back);
  const rows = bestRows(g.slug);
  if (!rows.length) { wrap.appendChild(el("p", "sc-empty", `No scores yet. Play ${g.name} to get on the board.`)); return; }
  // podium: 2nd, 1st, 3rd
  const pod = el("div", "sc-podium");
  for (const i of [1, 0, 2]) {
    const r = rows[i]; if (!r) continue;
    const p = el("div", "sc-pod");
    p.append(scoreAvatar(memberById(r.user_id)), el("b", null, scoreName(r.user_id)), el("small", null, `${r.score} pts`), el("div", `sc-stand r${i + 1}`, String(i + 1)));
    pod.appendChild(p);
  }
  wrap.appendChild(pod);
  // everyone else, numbered
  rows.forEach((r, i) => {
    if (i < 3) return;
    const it = el("div", "sc-item" + (state.me && r.user_id === state.me.id ? " me" : ""));
    const who = el("span", "sc-who");
    const date = new Date(r.at).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    who.append(document.createTextNode(scoreName(r.user_id)), el("small", null, date));
    it.append(el("span", "sc-rank", String(i + 1)), scoreAvatar(memberById(r.user_id)), who, el("span", "sc-pts", String(r.score)));
    wrap.appendChild(it);
  });
}

async function loadScores() {
  if (!state.board) return;
  await flushScores();
  try { scoresData = await api.listScores(state.board.id); } catch { /* keep what we have */ }
  if (!$("#gamesScreen").hidden && (gsMode === "scores" || gsMode === "board")) renderScores();
}
function loadPending() { try { return JSON.parse(localStorage.getItem(PENDING_KEY) || "[]"); } catch { return []; } }
function savePending(list) { try { localStorage.setItem(PENDING_KEY, JSON.stringify(list)); } catch { /* storage blocked */ } }
// sends any scores that did not go through yet (e.g. when offline)
async function flushScores() {
  const list = loadPending();
  if (!list.length || !state.board) return;
  const left = [];
  for (const it of list) {
    if (it.boardId !== state.board.id) { left.push(it); continue; }
    try { await api.submitScore(it.boardId, it.game, it.score); } catch { left.push(it); }
  }
  savePending(left);
}
async function saveScore(g, score) {
  if (!state.board) return;
  const s = Math.round(score);
  if (!Number.isFinite(s) || s < 0) return;
  savePending([...loadPending(), { boardId: state.board.id, game: g.slug, score: s }]);
  await flushScores();
  toast(`Saved ${s} in ${g.name}`);
  loadScores();
}
// games report their score when a run ends (postMessage from the game's iframe)
window.addEventListener("message", (e) => {
  const d = e.data;
  if (!gsPlaying || e.origin !== location.origin || e.source !== $("#gsFrame").contentWindow) return;
  if (!d || d.pinned !== 1 || d.t !== "over" || typeof d.score !== "number") return;
  saveScore(gsPlaying, d.score);
});
// keep the Scores tab fresh while it is open
setInterval(() => { if (!$("#gamesScreen").hidden && (gsMode === "scores" || gsMode === "board")) loadScores(); }, 15000);
function closeSheet(name) {
  $("#" + name).hidden = true; $("#" + name + "Backdrop").hidden = true;
  if (name === "detail") { detailId = null; if (detailAudio) { detailAudio.pause(); detailAudio = null; } $("#detailBody").innerHTML = ""; }
  if (name === "chats") { chat.peer = null; }
  if (name === "together") closeTogether();
}

// ---------------------------------------------------------------- note detail
let detailId = null, detailAudio = null;
// ---------------------------------------------------------------- lists (to-do and wish)
function listItemsFrom(text) {
  return text.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 40)
    .map((t) => ({ id: uid(), text: t.slice(0, 120), done: false }));
}
function listIcon(meta) { return meta?.mode === "wish" ? "✨" : "🛒"; }

// the small card on the board
function buildListContent(n, el) {
  const meta = n.meta || {}, items = meta.items || [];
  el.innerHTML = "";
  const h = document.createElement("div"); h.className = "list-title";
  h.textContent = `${listIcon(meta)} ${meta.title || n.body || "List"}`; el.appendChild(h);
  const ul = document.createElement("ul"); ul.className = "list-items";
  for (const it of items.slice(0, 6)) {
    const li = document.createElement("li"); li.textContent = it.text; if (it.done) li.classList.add("done"); ul.appendChild(li);
  }
  el.appendChild(ul);
  if (items.length > 6) { const m = document.createElement("div"); m.className = "list-more"; m.textContent = `+${items.length - 6} more`; el.appendChild(m); }
  const c = document.createElement("div"); c.className = "list-count";
  c.textContent = `${items.filter((i) => i.done).length} of ${items.length} done`; el.appendChild(c);
}

// the interactive view in the note sheet: tick items, add items
function renderListDetail(box, id) {
  const n = state.notes.get(id); if (!n) return;
  const meta = n.meta || {}, items = meta.items || [];
  box.innerHTML = ""; box.className = "list-detail";
  paintPaper(box, n.color);
  const h = document.createElement("h3"); h.textContent = `${listIcon(meta)} ${meta.title || n.body || "List"}`; box.appendChild(h);
  for (const it of items) {
    const row = document.createElement("label"); row.className = "list-row" + (it.done ? " done" : "");
    const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = !!it.done;
    cb.onchange = () => setListItems(id, (state.notes.get(id)?.meta?.items || []).map((x) => x.id === it.id ? { ...x, done: cb.checked } : x));
    const sp = document.createElement("span"); sp.textContent = it.text;
    row.append(cb, sp); box.appendChild(row);
  }
  const form = document.createElement("form"); form.className = "list-add";
  const inp = document.createElement("input"); inp.placeholder = "Add an item"; inp.maxLength = 120; inp.autocomplete = "off";
  const add = document.createElement("button"); add.type = "submit"; add.className = "btn small"; add.textContent = "Add";
  form.append(inp, add);
  form.onsubmit = (e) => {
    e.preventDefault();
    const t = inp.value.trim(); if (!t) return;
    const cur = state.notes.get(id)?.meta?.items || [];
    if (cur.length >= 40) return toast("That list is full");
    setListItems(id, [...cur, { id: uid(), text: t.slice(0, 120), done: false }]);
    inp.value = "";
  };
  box.appendChild(form);
}

async function setListItems(id, items) {
  const n = state.notes.get(id); if (!n) return;
  try {
    await editNoteTo(id, { meta: { ...(n.meta || {}), items } });
    if (detailId === id) { const box = document.querySelector("#detailBody .list-detail"); if (box) renderListDetail(box, id); }
  } catch (e) {
    console.error(e);
    toast(state.v2 || isDemo ? "Couldn't update the list" : "Lists need the latest database update (upgrade-v16.sql)", 4500);
  }
}

function openDetail(id) {
  const n = state.notes.get(id); if (!n) return;
  detailId = id;
  const wrap = $("#detailBody"); wrap.innerHTML = "";
  if (detailAudio) { detailAudio.pause(); detailAudio = null; }
  if (n.kind === "list") { const box = document.createElement("div"); wrap.appendChild(box); renderListDetail(box, id); }
  else if (n.kind === "voice") wrap.appendChild(audioPlayer(n, true));
  else if (n.kind === "link") {
    const md = n.meta || {};
    const box = document.createElement("div"); box.className = "detail-player";
    if (md.embed) {
      if (state.playing === n.id) playCard(n.id);   // move playback into the sheet
      const f = document.createElement("iframe"); f.src = md.embed; f.height = Math.max(md.h || 152, 152);
      if (md.provider === "YouTube") f.style.aspectRatio = "16 / 9", f.removeAttribute("height");
      f.allow = "autoplay; encrypted-media; clipboard-write; picture-in-picture"; f.setAttribute("allowfullscreen", ""); f.title = md.title || md.provider;
      box.appendChild(f);
    }
    const t = document.createElement("b"); t.textContent = md.title || md.url; box.appendChild(t);
    const open = document.createElement("a"); open.className = "btn small"; open.href = md.url; open.target = "_blank"; open.rel = "noopener"; open.textContent = `Open in ${md.embed ? md.provider : "browser"} ↗`;
    box.appendChild(open);
    wrap.appendChild(box);
  }
  else {
    const el = document.createElement("div"); buildNoteContent(n, el);
    el.querySelector(".badges")?.remove(); el.querySelector(".pinmark")?.remove();
    wrap.appendChild(el);
  }
  renderDetailMeta(n);
  $("#detailEdit").hidden = !canEdit(n) || n.kind === "list";
  renderReactRow();
  renderReplies();
  $("#replyInput").value = "";
  noteEl(id)?.classList.remove("fresh");
  openSheet("detail");
  if (n.author_id !== state.me?.id && !n.seen_at) markPartnerSeen(0);
}

function renderDetailMeta(n) {
  let meta = `From ${nameOf(n.author_id)} · ${timeAgo(n.show_at && !isScheduled(n) ? n.show_at : n.created_at)}`;
  if (isScheduled(n)) meta += ` · shows ${fmtWhen(n.show_at)}`;
  else if (n.author_id === state.me?.id && n.seen_at) meta += ` · seen ${timeAgo(n.seen_at)}`;
  $("#detailMeta").textContent = meta;
  $("#detailPin").textContent = n.pinned ? "Unpin" : "📌 Pin";
}

function audioPlayer(n, autoplay) {
  const wrap = document.createElement("div"); wrap.className = "detail-audio";
  paintPaper(wrap, n.color);
  wrap.innerHTML = `<button type="button" aria-label="Play">▶</button><div class="bar"><i></i></div><span class="t">0:00</span>`;
  const btn = wrap.querySelector("button"), fill = wrap.querySelector(".bar i"), t = wrap.querySelector(".t");
  const a = new Audio(state.urls[n.media_path] || "");
  a.preload = "auto";
  const total = n.meta?.duration || 0;
  t.textContent = fmtDur(total);
  btn.onclick = () => (a.paused ? a.play().catch(() => toast("Couldn't play this voice note")) : a.pause());
  a.onplay = () => (btn.textContent = "❚❚");
  a.onpause = () => (btn.textContent = "▶");
  a.onended = () => { btn.textContent = "▶"; fill.style.width = "0"; t.textContent = fmtDur(total); };
  a.ontimeupdate = () => {
    const d = isFinite(a.duration) && a.duration > 0 ? a.duration : total || 1;
    fill.style.width = Math.min(100, (a.currentTime / d) * 100) + "%";
    t.textContent = fmtDur(a.currentTime);
  };
  a.onerror = () => toast("This voice note can't play on this phone");
  detailAudio = a;
  if (autoplay) a.play().catch(() => {});
  return wrap;
}

function renderReactRow() {
  const row = $("#reactRow"); row.innerHTML = "";
  const n = state.notes.get(detailId); if (!n) return;
  const list = state.reactions.get(n.id) || [];
  for (const em of REACTIONS) {
    const count = list.filter((r) => r.emoji === em).length;
    const mine = list.some((r) => r.emoji === em && r.user_id === state.me.id);
    const b = document.createElement("button"); b.type = "button";
    b.setAttribute("aria-pressed", String(mine));
    b.innerHTML = `<span></span>${count ? `<b>${count}</b>` : ""}`;
    b.querySelector("span").textContent = em;
    b.onclick = () => toggleReaction(em);
    row.appendChild(b);
  }
}

async function toggleReaction(emoji) {
  const n = state.notes.get(detailId); if (!n) return;
  const list = state.reactions.get(n.id) || [];
  const mine = list.find((r) => r.user_id === state.me.id && r.emoji === emoji);
  try {
    if (mine) {
      state.reactions.set(n.id, list.filter((r) => r !== mine));
      renderReactRow(); redecorate(n.id);
      await api.removeReaction(n.id, emoji);
    } else {
      const r = { note_id: n.id, board_id: state.board.id, user_id: state.me.id, emoji };
      state.reactions.set(n.id, [...list, r]);
      renderReactRow(); redecorate(n.id);
      rain(emoji, 6);
      await api.addReaction(r);
      if (n.author_id !== state.me.id) api.notify(state.board.id, "reaction", { emoji });
    }
  } catch (e) {
    console.warn(e);
    state.reactions.set(n.id, list); renderReactRow(); redecorate(n.id);
    state.v2 ? toast("Couldn't save that reaction") : needsUpgrade();
  }
}

function onReactionEvent(row, deleted) {
  const list = state.reactions.get(row.note_id) || [];
  const same = (r) => r.user_id === row.user_id && r.emoji === row.emoji;
  if (deleted) state.reactions.set(row.note_id, list.filter((r) => !same(r)));
  else {
    if (list.some(same)) return;
    state.reactions.set(row.note_id, [...list, row]);
    const n = state.notes.get(row.note_id);
    if (row.user_id !== state.me.id && n?.author_id === state.me.id) toast(`${memberById(row.user_id)?.name || "Your person"} reacted ${row.emoji}`);
  }
  redecorate(row.note_id);
  if (detailId === row.note_id) renderReactRow();
}

function renderReplies() {
  const box = $("#replyList"); box.innerHTML = "";
  const list = (state.replies.get(detailId) || []).slice().sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
  for (const r of list) {
    const d = document.createElement("div");
    d.className = "reply" + (r.author_id === state.me.id ? " mine" : "");
    d.textContent = r.body;
    const s = document.createElement("small"); s.textContent = `${nameOf(r.author_id)} · ${timeAgo(r.created_at)}`;
    d.appendChild(s);
    box.appendChild(d);
  }
  box.scrollTop = box.scrollHeight;
}

async function sendReply() {
  const body = $("#replyInput").value.trim();
  const n = state.notes.get(detailId);
  if (!body || !n) return;
  const btn = $("#replySend"); busy(btn, true, "…");
  try {
    const row = await api.addReply({ note_id: n.id, board_id: state.board.id, author_id: state.me.id, body });
    onReplyEvent(row);
    $("#replyInput").value = "";
    api.notify(state.board.id, "reply");
  } catch (e) { console.warn(e); state.v2 ? toast("Couldn't send the reply") : needsUpgrade(); }
  busy(btn, false);
}

function onReplyEvent(row) {
  const list = state.replies.get(row.note_id) || [];
  if (list.some((r) => r.id === row.id)) return;
  state.replies.set(row.note_id, [...list, row]);
  if (row.author_id !== state.me.id) toast(`${memberById(row.author_id)?.name || "Your person"} replied: ${row.body.slice(0, 60)}`);
  redecorate(row.note_id);
  if (detailId === row.note_id) renderReplies();
}

async function editNoteTo(id, fields) {
  const n = state.notes.get(id); if (!n) return;
  Object.assign(n, fields); await upsertNote({ ...n }); await api.updateNote(id, fields);
}
async function removeDetail() {
  const n = state.notes.get(detailId); if (!n) return;
  if (!confirm("Remove this from the board for both of you?")) return;
  closeSheet("detail");
  const row = noteRowFor(n);
  removeNoteEl(n.id);
  try {
    await api.deleteNote(n);
    let liveId = n.id;
    // media notes can't be cleanly re-created from the client, so only offer undo for simple notes
    if (!n.media_path) pushHist({
      label: "delete",
      undo: async () => { const saved = await api.addNote(row); liveId = saved.id; await upsertNote(saved); },
      redo: async () => { const cur = state.notes.get(liveId); removeNoteEl(liveId); state.notes.delete(liveId); if (cur) await api.deleteNote(cur); },
    });
  } catch (e) { toast("Couldn't remove it"); resync(); }
}
const noteRowFor = (n) => { const { id, created_at, updated_at, seen_at, _pending, _dragFrom, notified_at, ...rest } = n; return rest; };
async function frontDetail() {
  const n = state.notes.get(detailId); if (!n) return;
  n.z = Date.now(); const el = noteEl(n.id); if (el) placeNote(el, n);
  closeSheet("detail");
  try { await api.updateNote(n.id, { z: n.z }); } catch { /* ignore */ }
}
async function pinDetail() {
  const n = state.notes.get(detailId); if (!n) return;
  n.pinned = !n.pinned;
  const el = noteEl(n.id); if (el) { placeNote(el, n); decorate(el, n); }
  renderDetailMeta(n);
  toast(n.pinned ? "Pinned. It stays on top and can't be dragged by accident." : "Unpinned");
  try { await api.updateNote(n.id, { pinned: n.pinned }); }
  catch (e) { n.pinned = !n.pinned; if (el) { placeNote(el, n); decorate(el, n); } renderDetailMeta(n); state.v2 ? toast("Couldn't pin it") : needsUpgrade(); }
}

// ---------------------------------------------------------------- export your board
// A small zip writer (no compression: photos and audio are already compressed).
const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(bytes) { let c = 0xFFFFFFFF; for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function makeZip(files) {
  const enc = new TextEncoder(), parts = [], central = [];
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(f.name), crc = crc32(f.data), size = f.data.length;
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true);
    h.setUint16(8, 0, true); h.setUint16(10, 0, true); h.setUint16(12, 0x21, true);
    h.setUint32(14, crc, true); h.setUint32(18, size, true); h.setUint32(22, size, true);
    h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
    parts.push(new Uint8Array(h.buffer), name, f.data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
    c.setUint16(10, 0, true); c.setUint16(12, 0, true); c.setUint16(14, 0x21, true);
    c.setUint32(16, crc, true); c.setUint32(20, size, true); c.setUint32(24, size, true);
    c.setUint16(28, name.length, true); c.setUint32(42, offset, true);
    central.push(new Uint8Array(c.buffer), name);
    offset += 30 + name.length + size;
  }
  const csize = central.reduce((n, p) => n + p.length, 0);
  const e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true);
  e.setUint32(12, csize, true); e.setUint32(16, offset, true);
  return new Blob([...parts, ...central, new Uint8Array(e.buffer)], { type: "application/zip" });
}

// Download everything on this board: notes, replies, and every photo, drawing and voice note.
async function exportBoard() {
  const btn = $("#exportBoardBtn");
  busy(btn, true, "Packing…");
  try {
    const boardId = state.board.id;
    const names = Object.fromEntries(state.members.map((m) => [m.id, m.name]));
    const notes = await api.listNotes(boardId);
    const replies = await api.listReplies(boardId);
    const paths = [...new Set(notes.map((n) => n.media_path).filter(Boolean))];
    const urls = paths.length ? await api.mediaUrls(paths) : {};
    const enc = new TextEncoder();
    const files = [];
    const note = (n) => ({ ...n, author: names[n.author_id] || "someone", media_file: n.media_path ? `media/${n.media_path.split("/").pop()}` : null });
    const reply = (r) => ({ ...r, author: names[r.user_id] || "someone" });
    const meta = { exported_at: new Date().toISOString(), board_id: boardId, board_name: state.board.name ?? null, members: state.members.map((m) => m.name), note_count: notes.length, reply_count: replies.length, media_count: paths.length };
    files.push({ name: "board.json", data: enc.encode(JSON.stringify(meta, null, 2)) });
    files.push({ name: "notes.json", data: enc.encode(JSON.stringify(notes.map(note), null, 2)) });
    files.push({ name: "replies.json", data: enc.encode(JSON.stringify(replies.map(reply), null, 2)) });
    let missing = 0;
    for (const p of paths) {
      const url = urls[p];
      if (!url) { missing++; continue; }
      try {
        const blob = await (await fetch(url)).blob();
        files.push({ name: `media/${p.split("/").pop()}`, data: new Uint8Array(await blob.arrayBuffer()) });
      } catch { missing++; }
    }
    const zip = makeZip(files);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = URL.createObjectURL(zip);
    a.download = `pinned-export-${stamp}.zip`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 60000);
    toast(missing ? `Exported. ${missing} photo(s) couldn't be fetched, try again later.` : "Exported 📦 Check your downloads.", 5000);
  } catch (e) {
    console.error(e);
    toast("Couldn't export right now. Check your connection and try again.", 5000);
  } finally { busy(btn, false); }
}

// ---------------------------------------------------------------- composer
const compose = { tab: ls.get("pinned-compose-tab", "text"), color: ls.get("pinned-note-color", "c1"), emoji: "❤️", photo: null, padColor: ls.get("pinned-pen-color", "c1"), cdColor: "c5", sched: false };


function openComposer() {
  deselect();
  compose.photo = null;
  $("#textInput").value = ""; $("#photoCaption").value = ""; $("#emojiCustom").value = "";
  $("#photoPreview").hidden = true; $("#photoHint").hidden = false; $("#photoInput").value = "";
  $("#cdTitle").value = ""; $("#cdDate").value = ""; $("#cdTime").value = "";
  $("#listTitle").value = ""; $("#listItems").value = "";
  $("#linkInput").value = ""; $("#linkPreview").innerHTML = ""; linkMeta = null;
  pad.reset();
  resetRec();
  setSched(false);
  updateCdPreview();
  setTab(compose.tab);
  openSheet("composer");
  if (compose.tab === "text") setTimeout(() => $("#textInput").focus(), 250);
}

function setTab(tab) {
  if (compose.tab === "voice" && tab !== "voice" && rec.mr?.state === "recording") stopRec();
  compose.tab = tab;
  ls.set("pinned-compose-tab", tab);
  document.querySelectorAll("#composerTabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  document.querySelectorAll("#composer .pane").forEach((p) => (p.hidden = p.dataset.pane !== tab));
}

function setSched(on) {
  compose.sched = on;
  $("#schedToggle").setAttribute("aria-pressed", String(on));
  $("#schedRow").hidden = !on;
  if (on && !$("#schedAt").value) setQuick("morning");
  $("#composerSend").textContent = on ? "Schedule it" : "Stick it";
}

function setQuick(q) {
  const d = new Date();
  if (q === "morning") { d.setDate(d.getDate() + 1); d.setHours(7, 0, 0, 0); }
  if (q === "tonight") { d.setHours(21, 0, 0, 0); if (d < new Date()) d.setDate(d.getDate() + 1); }
  if (q === "hour") d.setTime(Date.now() + 3600e3);
  $("#schedAt").value = toLocalInput(d);
}

function updateCdPreview() {
  const meta = cdMeta() || { target: new Date(Date.now() + 12 * 864e5).toISOString(), allDay: true, title: "our trip ✈️" };
  const p = countdownParts(meta);
  $("#cdPrevBig").textContent = p.big; $("#cdPrevUnit").textContent = p.unit; $("#cdPrevTitle").textContent = p.title || $("#cdTitle").placeholder;
  paintPaper($("#cdPreview"), compose.cdColor);
}

function cdMeta() {
  const date = $("#cdDate").value; if (!date) return null;
  const time = $("#cdTime").value;
  const target = new Date(`${date}T${time || "00:00"}`);
  if (isNaN(target)) return null;
  return { target: target.toISOString(), allDay: !time, title: $("#cdTitle").value.trim() };
}

// Find an open spot in the visible part of the board, leaning toward the middle.
function viewportSpot(w, h) {
  const r = vp(), s = state.view.s;
  const tl = toWorld(r.left, r.top + 60), br = toWorld(r.right, r.bottom - 90);
  const c = toWorld(r.left + r.width / 2, r.top + r.height / 2);
  const rects = [...state.notes.values()].map(noteBox);
  const step = Math.max(16, 20 / s);
  let best = null;
  for (let y = tl.y; y <= Math.max(tl.y, br.y - h); y += step) {
    for (let x = tl.x; x <= Math.max(tl.x, br.x - w); x += step) {
      let overlap = 0;
      for (const q of rects) {
        const ox = Math.max(0, Math.min(x + w, q.x + q.w) - Math.max(x, q.x));
        const oy = Math.max(0, Math.min(y + h, q.y + q.h) - Math.max(y, q.y));
        overlap += ox * oy;
      }
      const score = overlap * 4 + Math.hypot(x + w / 2 - c.x, y + h / 2 - c.y);
      if (!best || score < best.score) best = { x, y, score };
    }
  }
  best = best || { x: c.x - w / 2, y: c.y - h / 2 };
  const jitter = () => Math.round((Math.random() - 0.5) * 16);
  return { x: Math.round(best.x + jitter()), y: Math.round(best.y + jitter()) };
}

const AUDIO_EXT = { "audio/mp4": "m4a", "audio/x-m4a": "m4a", "audio/webm": "webm", "audio/ogg": "ogg", "audio/mpeg": "mp3", "audio/aac": "aac" };

async function sendCompose() {
  const btn = $("#composerSend");
  const base = { board_id: state.board.id, author_id: state.me.id, rot: Math.round((Math.random() * 8 - 4) * 10) / 10, z: Date.now() };
  let showAt = null;
  if (compose.sched) {
    const d = new Date($("#schedAt").value);
    if (isNaN(d) || d.getTime() < Date.now() + 60e3) return toast("Pick a time at least a minute from now");
    showAt = d.toISOString();
    if (!state.v2 && !isDemo) return needsUpgrade();
  }
  if (showAt) base.show_at = showAt;
  let row, localUrl = null;
  try {
    busy(btn, true, showAt ? "Scheduling…" : "Sticking…");
    if (compose.tab === "text") {
      const body = $("#textInput").value.trim();
      if (!body) { busy(btn, false); return toast("Write something first"); }
      row = { ...base, kind: "text", body, color: compose.color, ...viewportSpot(150, 150) };
    } else if (compose.tab === "emoji") {
      const body = ($("#emojiCustom").value.trim() || compose.emoji).slice(0, 8);
      row = { ...base, kind: "emoji", body, color: "c1", ...viewportSpot(80, 80) };
    } else if (compose.tab === "image") {
      if (!compose.photo) { busy(btn, false); return toast("Pick a photo first"); }
      const path = await api.uploadMedia(state.board.id, compose.photo, "jpg");
      localUrl = URL.createObjectURL(compose.photo);
      row = { ...base, kind: "image", media_path: path, body: $("#photoCaption").value.trim() || null, color: "c1", ...viewportSpot(172, 200) };
    } else if (compose.tab === "drawing") {
      if (pad.isEmpty()) { busy(btn, false); return toast("Draw something first"); }
      const blob = await pad.toBlob();
      const path = await api.uploadMedia(state.board.id, blob, "png");
      localUrl = pad.lastUrl;
      row = { ...base, kind: "drawing", media_path: path, color: compose.padColor, ...viewportSpot(160, 160) };
    } else if (compose.tab === "voice") {
      if (rec.mr?.state === "recording") stopRec();
      if (!rec.blob) { busy(btn, false); return toast("Record something first"); }
      if (!state.v2 && !isDemo) { busy(btn, false); return needsUpgrade(); }
      const type = rec.blob.type.split(";")[0] || "audio/webm";
      const path = await api.uploadMedia(state.board.id, rec.blob, AUDIO_EXT[type] || "webm");
      localUrl = rec.url;
      row = { ...base, kind: "voice", media_path: path, color: compose.color, meta: { duration: Math.round(rec.dur) }, ...viewportSpot(160, 90) };
    } else if (compose.tab === "link") {
      if (!linkMeta) { busy(btn, false); return toast("Paste a link first"); }
      if (!state.v2 && !isDemo) { busy(btn, false); return needsUpgrade(); }
      row = { ...base, kind: "link", body: linkMeta.title || linkMeta.url, color: "c1", meta: { ...linkMeta }, ...viewportSpot(220, 200) };
    } else if (compose.tab === "list") {
      const title = $("#listTitle").value.trim();
      const items = listItemsFrom($("#listItems").value);
      if (!title) { busy(btn, false); return toast("Name the list first"); }
      if (!items.length) { busy(btn, false); return toast("Add at least one item"); }
      if (!state.v2 && !isDemo) { busy(btn, false); return needsUpgrade(); }
      const mode = $("#listMode").value === "wish" ? "wish" : "todo";
      row = { ...base, kind: "list", body: title, color: compose.color, meta: { title, mode, items }, ...viewportSpot(190, 210) };
    } else if (compose.tab === "countdown") {
      const meta = cdMeta();
      if (!meta) { busy(btn, false); return toast("Pick the date you're counting down to"); }
      if (!meta.title) { busy(btn, false); return toast("Give it a name, like \"Our trip ✈️\""); }
      if (!state.v2 && !isDemo) { busy(btn, false); return needsUpgrade(); }
      row = { ...base, kind: "countdown", body: meta.title, color: compose.cdColor, meta, ...viewportSpot(150, 150) };
    }
    const saved = await api.addNote(row);
    if (saved.media_path && localUrl) state.urls[saved.media_path] = localUrl;  // show our own upload right away
    await upsertNote(saved);
    haptic(15);
    if (!saved.media_path && !showAt) {
      let liveId = saved.id;
      pushHist({ label: "new note",
        undo: async () => { const cur = state.notes.get(liveId); removeNoteEl(liveId); state.notes.delete(liveId); if (cur) await api.deleteNote(cur); },
        redo: async () => { const re = await api.addNote(noteRowFor(saved)); liveId = re.id; await upsertNote(re); } });
    }
    closeSheet("composer");
    if (showAt) toast(`Scheduled for ${fmtWhen(showAt)} ⏰ Only you can see it until then.`, 4000);
    else api.notify(state.board.id, "note", { note_id: saved.id });
    if (compose.tab === "voice") resetRec(true);
  } catch (e) {
    console.error(e);
    const msg = e.message || "";
    if (isNetworkError(e) && row && !row.media_path) {
      // offline: save it locally and send on reconnect
      const tempId = uid();
      await upsertNote({ ...row, id: tempId, _pending: true, created_at: new Date().toISOString() });
      queueNote(row, tempId);
      closeSheet("composer");
      updateConn();
      toast("Offline — saved and will send when you're back ⏳", 3500);
    }
    else if (/mime|type/i.test(msg) && compose.tab === "voice") needsUpgrade();
    else if (/violates check constraint|column .* does not exist|schema cache/i.test(msg)) toast(compose.tab === "link" ? "Music cards need upgrade-v6.sql in Supabase" : "This needs the latest database update (see SETUP)", 4500);
    else toast("Couldn't stick that note", 7000, { label: "Retry", fn: () => sendCompose() });
  } finally { busy(btn, false); $("#composerSend").textContent = compose.sched ? "Schedule it" : "Stick it"; }
}

async function compressImage(file, max = 1280, quality = 0.82) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("That file isn't an image I can read")); i.src = url; });
    const r = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * r); c.height = Math.round(img.naturalHeight * r);
    const ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return await new Promise((res) => c.toBlob(res, "image/jpeg", quality));
  } finally { URL.revokeObjectURL(url); }
}

// ---------------------------------------------------------------- voice recorder
const rec = { mr: null, chunks: [], blob: null, url: null, start: 0, timer: null, dur: 0, discard: false };
function pickMime() {
  const c = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
  return c.find((t) => window.MediaRecorder?.isTypeSupported?.(t)) || "";
}
async function toggleRec() {
  if (rec.mr?.state === "recording") return stopRec();
  if (!window.MediaRecorder || !navigator.mediaDevices?.getUserMedia) return toast("Voice notes aren't supported in this browser");
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
  catch { return toast("Allow the microphone to record a voice note"); }
  const mime = pickMime();
  rec.chunks = []; rec.blob = null; rec.discard = false;
  rec.mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  rec.mr.ondataavailable = (e) => e.data.size && rec.chunks.push(e.data);
  rec.mr.onstop = () => {
    stream.getTracks().forEach((t) => t.stop());
    if (rec.discard) return;
    const type = (rec.mr.mimeType || mime || "audio/webm").split(";")[0];
    rec.blob = new Blob(rec.chunks, { type });
    rec.dur = Math.max(1, (Date.now() - rec.start) / 1000);
    rec.url = URL.createObjectURL(rec.blob);
    $("#recPreview").hidden = false;
    $("#recHint").textContent = "Sounds good? Tap Stick it to send.";
  };
  rec.mr.start(250);
  rec.start = Date.now();
  $("#recBtn").classList.add("on");
  $("#recHint").textContent = "Recording… tap to stop";
  $("#recPreview").hidden = true;
  rec.timer = setInterval(() => {
    const s = (Date.now() - rec.start) / 1000;
    $("#recTime").textContent = fmtDur(Math.floor(s));
    if (s >= 60) stopRec();
  }, 200);
}
function stopRec() {
  clearInterval(rec.timer);
  $("#recBtn").classList.remove("on");
  try { if (rec.mr?.state === "recording") rec.mr.stop(); } catch { /* ignore */ }
}
let recAudio = null;
function resetRec(keepUrl = false) {
  if (rec.mr?.state === "recording") { rec.discard = true; stopRec(); }
  if (recAudio) { recAudio.pause(); recAudio = null; }
  if (rec.url && !keepUrl) URL.revokeObjectURL(rec.url);
  rec.blob = null; rec.url = null; rec.dur = 0;
  $("#recTime").textContent = "0:00";
  $("#recPreview").hidden = true;
  $("#recHint").textContent = "Tap to record. Up to 60 seconds.";
}
function playRec() {
  if (!rec.url) return;
  if (recAudio && !recAudio.paused) { recAudio.pause(); return; }
  recAudio = new Audio(rec.url);
  recAudio.onended = () => ($("#recPlay").textContent = "▶ Play");
  recAudio.onpause = () => ($("#recPlay").textContent = "▶ Play");
  recAudio.play().then(() => ($("#recPlay").textContent = "❚❚ Pause")).catch(() => toast("Couldn't play it back"));
}

// ---------------------------------------------------------------- drawing pads
function makePad(canvas, { owner = "me", onLive = null, onDone = null } = {}) {
  const ctx = canvas.getContext("2d"), S = canvas.width;
  let strokes = [], current = null, color = PENS[0], size = SIZES[1], erasing = false, lastLive = 0;
  const remote = new Map();
  const visible = () => { const i = strokes.map((s) => !!s.clear).lastIndexOf(true); return strokes.slice(i + 1); };
  function drawStroke(s) {
    const p = s.points; if (!p || !p.length) return;
    ctx.globalCompositeOperation = s.erase ? "destination-out" : "source-over";
    ctx.strokeStyle = s.color; ctx.fillStyle = s.color;
    ctx.lineWidth = s.size * 2 * (s.erase ? 1.6 : 1); ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (p.length === 1) { ctx.beginPath(); ctx.arc(p[0][0], p[0][1], ctx.lineWidth / 2, 0, Math.PI * 2); ctx.fill(); return; }
    ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < p.length - 1; i++) {
      const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2;
      ctx.quadraticCurveTo(p[i][0], p[i][1], mx, my);
    }
    const l = p[p.length - 1]; ctx.lineTo(l[0], l[1]); ctx.stroke();
  }
  function redraw() {
    ctx.globalCompositeOperation = "source-over"; ctx.clearRect(0, 0, S, S);
    for (const s of visible()) drawStroke(s);
    for (const s of remote.values()) drawStroke(s);
    if (current) drawStroke(current);
    ctx.globalCompositeOperation = "source-over";
  }
  function pt(e) {
    const r = canvas.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * S, ((e.clientY - r.top) / r.height) * S];
  }
  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    current = { id: uid(), owner, color, size, erase: erasing, points: [pt(e)] }; redraw();
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!current) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of evs) current.points.push(pt(ev));
    redraw();
    if (onLive && Date.now() - lastLive > 60) { lastLive = Date.now(); onLive(current); }
  });
  const end = () => { if (current) { strokes.push(current); onDone?.(current); current = null; redraw(); } };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);

  const self = {
    lastUrl: null,
    reset() { strokes = []; remote.clear(); current = null; redraw(); },
    isEmpty() { return !visible().some((s) => !s.erase) && remote.size === 0; },
    undo() { strokes.pop(); redraw(); },
    undoOwn() {
      for (let i = strokes.length - 1; i >= 0; i--) if (strokes[i].owner === owner && !strokes[i].clear) { const [s] = strokes.splice(i, 1); redraw(); return s.id; }
      return null;
    },
    clear() { if (strokes.length) { strokes.push({ clear: true }); redraw(); } },
    clearAll() { strokes = []; remote.clear(); redraw(); },
    setColor(c) { color = c; erasing = false; },
    setSize(s) { size = s; },
    toggleEraser() { erasing = !erasing; },
    tools() { return { color, size, erasing }; },
    remoteLive(s) { remote.set(s.id, s); redraw(); },
    remoteDone(s) { remote.delete(s.id); if (!strokes.some((x) => x.id === s.id)) strokes.push(s); redraw(); },
    remove(id) { strokes = strokes.filter((s) => s.id !== id); remote.delete(id); redraw(); },
    getStrokes() { return visible(); },
    setStrokes(arr) { strokes = arr.slice(); redraw(); },
    toBlob() { return new Promise((res) => canvas.toBlob((b) => { self.lastUrl = URL.createObjectURL(b); res(b); }, "image/png")); },
  };
  return self;
}

function buildTools(els, p, { onUndo, onClear, slider } = {}) {
  const sync = () => {
    const t = p.tools();
    els.pens.querySelectorAll(".pen").forEach((b) => b.setAttribute("aria-pressed", String(!t.erasing && b.dataset.c === t.color)));
    els.eraser.setAttribute("aria-pressed", String(t.erasing));
  };
  els.pens.innerHTML = "";
  for (const c of PENS) {
    const b = document.createElement("button"); b.className = "pen"; b.type = "button"; b.dataset.c = c; b.style.background = c;
    b.setAttribute("aria-label", "Pen color " + c); b.onclick = () => { p.setColor(c); sync(); }; els.pens.appendChild(b);
  }
  els.sizes.innerHTML = "";
  if (slider) {   // the board: a continuous brush size from 1 to 24
    const wrap = document.createElement("label"); wrap.className = "size-slider";
    const dot = document.createElement("span"); dot.className = "size-dot";
    const r = document.createElement("input"); r.type = "range"; r.min = "1"; r.max = "24"; r.step = "1"; r.value = String(p.tools().size);
    r.setAttribute("aria-label", "Brush size");
    const show = () => { const d = Math.max(3, Math.min(22, +r.value)); dot.style.width = dot.style.height = d + "px"; };
    r.oninput = () => { p.setSize(+r.value); show(); };
    show(); wrap.append(dot, r); els.sizes.appendChild(wrap);
  }
  if (!slider) SIZES.forEach((sz, i) => {
    const b = document.createElement("button"); b.className = "size"; b.type = "button"; b.setAttribute("aria-label", ["Small", "Medium", "Large"][i] + " brush");
    b.innerHTML = `<span style="width:${4 + i * 5}px;height:${4 + i * 5}px"></span>`;
    b.setAttribute("aria-pressed", String(sz === p.tools().size));
    b.onclick = () => { p.setSize(sz); els.sizes.querySelectorAll(".size").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); };
    els.sizes.appendChild(b);
  });
  els.eraser.onclick = () => { p.toggleEraser(); sync(); };
  els.undo.onclick = onUndo || (() => p.undo());
  els.clear.onclick = onClear || (() => p.clear());
  sync();
}

const pad = makePad($("#pad"));
buildTools({ pens: $("#penColors"), sizes: $("#penSizes"), eraser: $("#eraserBtn"), undo: $("#undoBtn"), clear: $("#clearBtn") }, pad);

// ---------------------------------------------------------------- draw together (live)
const together = { pad: null, open: false, notifiedPresence: false };
const packStroke = (s) => ({ id: s.id, owner: s.owner, color: s.color, size: s.size, erase: s.erase, points: s.points.map(([x, y]) => [Math.round(x), Math.round(y)]) });

function ensureTogetherPad() {
  if (together.pad) return together.pad;
  together.pad = makePad($("#tPad"), {
    owner: state.me.id,
    onLive: (s) => live?.send({ t: "live", s: packStroke(s) }),
    onDone: (s) => live?.send({ t: "done", s: packStroke(s) }),
  });
  buildTools({ pens: $("#tPens"), sizes: $("#tSizes"), eraser: $("#tEraser"), undo: $("#tUndo"), clear: $("#tClear") }, together.pad, {
    onUndo: () => { const id = together.pad.undoOwn(); if (id) live?.send({ t: "remove", id }); },
    onClear: () => {
      if (!confirm("Clear the drawing for both of you?")) return;
      together.pad.clearAll(); live?.send({ t: "clear" });
    },
  });
  paintPaper($("#tPadWrap"), "c1");
  return together.pad;
}

function openTogether() {
  ensureTogetherPad();
  together.open = true;
  openSheet("together");
  live?.track({ doodling: true });
  live?.send({ t: "hello" });
  renderPresence();
}

function closeTogether() {
  if (!together.open) return;
  together.open = false;
  live?.track({ doodling: false });
  renderPresence();
}

async function stickTogether() {
  const p = ensureTogetherPad();
  if (p.isEmpty()) return toast("Draw something first");
  const btn = $("#tStick"); busy(btn, true, "Sticking…");
  try {
    const blob = await p.toBlob();
    const path = await api.uploadMedia(state.board.id, blob, "png");
    const row = { board_id: state.board.id, author_id: state.me.id, kind: "drawing", media_path: path, color: "c1",
      rot: Math.round((Math.random() * 8 - 4) * 10) / 10, z: Date.now(), ...viewportSpot(160, 160) };
    const saved = await api.addNote(row);
    state.urls[saved.media_path] = p.lastUrl;
    await upsertNote(saved);
    api.notify(state.board.id, "note", { note_id: saved.id });
    toast("Stuck on the board 🎨");
  } catch (e) { toast(e.message || "Couldn't stick it"); }
  busy(btn, false);
}

function onLiveMessage(m) {
  if (m && m.fx) return fxRemote(m);
  if (!m || !m.t) return;
  if (m.t === "answered") return refreshQuestionDot();
  if (m.t === "cur") return onCursor(m);
  if (m.t === "typing") return onTyping(m);
  if (m.t === "view") { if (m.u !== state.me?.id) state.views[m.u] = { cx: m.cx, cy: m.cy, s: m.s, at: Date.now() }; return; }
  if (m.t === "vjoin" || m.t === "vleave" || m.t === "rtc") return onVoiceMsg(m);
  if (m.t === "ink") return onRemoteInk(m);
  if (m.t === "inkx") { const s = state.strokes.get(m.id); if (s?._live) removeInk(m.id); return; }
  const p = ensureTogetherPad();
  if (m.t === "hello") { const strokes = p.getStrokes(); if (strokes.length) live?.send({ t: "state", strokes: strokes.map(packStroke) }); }
  else if (m.t === "state") { if (!p.getStrokes().length && Array.isArray(m.strokes)) p.setStrokes(m.strokes); }
  else if (m.t === "live") p.remoteLive(m.s);
  else if (m.t === "done") p.remoteDone(m.s);
  else if (m.t === "remove") p.remove(m.id);
  else if (m.t === "clear") p.clearAll();
}

function onPresence(map) {
  const prev = state.presence;
  state.presence = map || {};
  for (const m of others()) {
    const was = prev[m.id]?.doodling, now = state.presence[m.id]?.doodling;
    if (now && !was && !together.open) toast(`${m.name} is drawing together. Tap 🎨 Together to join.`, 4000);
    const wasV = prev[m.id]?.voice, nowV = state.presence[m.id]?.voice;
    if (nowV && !wasV && !voice.on) toast(`${m.name} started a voice chat. Open the people panel to join.`, 4000);
    if (voice.on && wasV && !nowV) { const p = voice.peers.get(m.id); if (p) { closePeer(p); voice.peers.delete(m.id); renderVoiceBar(); } }   // they left voice
    if (!isOnline(m.id)) { document.querySelector(`#cursors .cursor[data-u="${CSS.escape(m.id)}"]`)?.remove(); const p = voice.peers.get(m.id); if (p) { closePeer(p); voice.peers.delete(m.id); renderVoiceBar(); } }
  }
  renderPresence();
  renderChips();
  renderLoc();
  renderVoiceJoin();
  renderVoiceBar();
}

function renderPresence() {
  const drawing = others().filter((m) => state.presence[m.id]?.doodling).map((m) => m.name);
  $("#doodleDot").hidden = !drawing.length || together.open;
  const w = $("#togetherWho");
  w.textContent = drawing.length ? `${listNames(drawing)} ${drawing.length > 1 ? "are" : "is"} here ✏️` : others().length ? "Nobody else here yet" : "Just you for now";
  w.classList.toggle("on", !!drawing.length);
}

// ---------------------------------------------------------------- check-ins
function buildPingGrid(el, items) {
  el.innerHTML = "";
  for (const [key, emoji, label] of items) {
    const b = document.createElement("button"); b.type = "button";
    b.innerHTML = `<span></span>`; b.querySelector("span").textContent = emoji;
    b.appendChild(document.createTextNode(label));
    b.onclick = () => sendPing(key);
    el.appendChild(b);
  }
}

function openPing() {
  renderPingLast();
  const myMood = state.pings.find((p) => p.user_id === state.me.id && p.kind.startsWith("mood_"));
  $("#pingMoods").querySelectorAll("button").forEach((b, i) => b.setAttribute("aria-pressed", String(myMood?.kind === MOODS[i][0] && !!latestMood(state.me.id))));
  openSheet("ping");
}

function renderPingLast() {
  const last = state.pings.find((p) => p.user_id !== state.me.id);
  const who = last && memberById(last.user_id);
  $("#pingLast").textContent = last && who ? `${who.name} ${PING_TEXT[last.kind] || ""} · ${timeAgo(last.created_at)}` : others().length ? "Let everyone know how you're doing." : "";
}

async function sendPing(key) {
  try {
    const row = await api.sendPing(state.board.id, key);
    if (!state.pings.some((p) => p.id === row.id)) state.pings.unshift(row);
    rain(PING_EMOJI[key], 10);
    renderChips(); openPing();
    const os = others();
    toast(key.startsWith("mood_") ? "Mood shared" : `Sent to ${os.length === 1 ? os[0].name : "everyone"} ${PING_EMOJI[key]}`);
    api.notify(state.board.id, "ping", { ping: key });
  } catch (e) { console.warn(e); state.v2 ? toast("Couldn't send that") : needsUpgrade(); }
}

function onPingEvent(row) {
  if (state.pings.some((p) => p.id === row.id)) return;
  state.pings.unshift(row);
  renderChips();
  if (!$("#ping").hidden) renderPingLast();
  if (row.user_id !== state.me.id) {
    toast(`${memberById(row.user_id)?.name || "Your person"} ${PING_TEXT[row.kind] || ""}`, 4000);
    rain(PING_EMOJI[row.kind] || "💕", 12);
  }
}

// ---------------------------------------------------------------- daily question
function questionFor(key) {
  const [y, m, d] = key.split("-").map(Number);
  const days = Math.floor(Date.UTC(y, m - 1, d) / 864e5);
  return QUESTIONS[((days % QUESTIONS.length) + QUESTIONS.length) % QUESTIONS.length];
}

async function openQuestion() {
  openSheet("question");
  await renderQuestion();
}

async function renderQuestion() {
  const key = localDateKey();
  $("#qDate").textContent = "Today's question · " + new Date().toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  $("#qText").textContent = questionFor(key);
  const since = localDateKey(new Date(Date.now() - 14 * 864e5));
  let rows = [], status = [];
  try { [rows, status] = await Promise.all([api.listAnswers(state.board.id, since), api.answerStatus(state.board.id, key)]); }
  catch (e) { console.warn(e); $("#qAnswers").innerHTML = ""; $("#qAnswerBox").hidden = true; return needsUpgrade(); }
  const me = state.me.id;
  const mine = rows.find((r) => r.user_id === me && r.qdate === key);
  const answeredOthers = others().filter((m) => status.includes(m.id));
  $("#qAnswerBox").hidden = !!mine;
  $("#qHint").textContent = answeredOthers.length && !mine
    ? `${listNames(answeredOthers.map((m) => m.name))} already answered! Share yours to see theirs 👀`
    : "You'll see everyone's answers once you've answered.";
  const box = $("#qAnswers"); box.innerHTML = "";
  const card = (who, text, waiting) => {
    const d = document.createElement("div"); d.className = "q-ans" + (waiting ? " waiting" : "");
    const b = document.createElement("b"); b.textContent = who; d.appendChild(b);
    d.appendChild(document.createTextNode(text)); box.appendChild(d);
  };
  if (mine) {
    card("You", mine.body);
    for (const m of others()) {
      const r = rows.find((x) => x.user_id === m.id && x.qdate === key);
      if (r) card(m.name, r.body);
    }
    const waiting = others().filter((m) => !rows.some((x) => x.user_id === m.id && x.qdate === key)).map((m) => m.name);
    if (waiting.length) card(waiting.length > 3 ? `${waiting.length} people` : listNames(waiting), "Haven't answered yet…", true);
  }
  // earlier days you answered together
  const past = $("#qPast"); past.innerHTML = "";
  const byDay = groupBy(rows.filter((r) => r.qdate !== key), "qdate");
  let shown = 0;
  for (const [day, list] of byDay) {
    if (list.length < 2) continue;
    const it = document.createElement("div"); it.className = "item";
    const p = document.createElement("p"); p.textContent = questionFor(day); it.appendChild(p);
    for (const r of list) {
      const d = document.createElement("div"); const b = document.createElement("b");
      b.textContent = (r.user_id === me ? "You" : memberById(r.user_id)?.name || "Someone") + ": "; d.appendChild(b); d.appendChild(document.createTextNode(r.body)); it.appendChild(d);
    }
    past.appendChild(it); shown++;
  }
  $("#qPastTitle").hidden = !shown;
  $("#qDot").hidden = !(answeredOthers.length && !mine);
}

async function sendAnswer() {
  const body = $("#qInput").value.trim();
  if (!body) return toast("Write an answer first");
  const btn = $("#qSend"); busy(btn, true, "Sharing…");
  try {
    await api.saveAnswer(state.board.id, localDateKey(), body);
    $("#qInput").value = "";
    api.notify(state.board.id, "answer");
    live?.send({ t: "answered" });
    await renderQuestion();
  } catch (e) { console.warn(e); state.v2 ? toast("Couldn't save your answer") : needsUpgrade(); }
  busy(btn, false);
}

async function refreshQuestionDot() {
  if (!state.board) return;
  try {
    const status = await api.answerStatus(state.board.id, localDateKey());
    $("#qDot").hidden = !(others().some((m) => status.includes(m.id)) && !status.includes(state.me.id));
    if (!$("#question").hidden) renderQuestion();
  } catch { $("#qDot").hidden = true; }
}

function clearBoardDom() {
  document.querySelectorAll("#board .note").forEach((e) => e.remove());
  $("#ink").innerHTML = ""; $("#cursors").innerHTML = "";
}

// ---------------------------------------------------------------- switch / leave / delete board
let leaving = false;
function resetBoardState() {
  clearInterval(ticker);
  state.board = null; state.members = [];
  state.notes.clear(); state.reactions = new Map(); state.replies = new Map(); state.pings = []; state.presence = {};
  clearBoardDom(); $("#memberChips").innerHTML = "";
  state.strokes = new Map(); state.cursors = new Map(); state.views = {};
  deselect(); setInkMode(false); closePeople();
  state.msgs = []; state.reads = new Map(); state.bgReqs = []; state.playing = null; chat.peer = null;
  $("#chatDot").hidden = true; $("#gearDot").hidden = true; clearBgLayer();
  if (geo.watch != null) { try { navigator.geolocation.clearWatch(geo.watch); } catch { /* ignore */ } }
  geo.on = false; geo.me = null; geo.watch = null; geo.denied = false; closeLoc(); $("#locDot").hidden = true;
  together.pad?.reset(); together.open = false;
  for (const s of ["detail", "composer", "settings", "ping", "question", "together", "chats", "edit"]) { $("#" + s).hidden = true; $("#" + s + "Backdrop").hidden = true; }
  $("#qDot").hidden = true; $("#doodleDot").hidden = true;
  hist.undo.length = 0; hist.redo.length = 0; renderHistBar();
  if (voice.on) leaveVoice();
  $("#connBanner").hidden = true;
  $("#codeInput").value = ""; setError($("#pairError"));
}

function canDeleteBoard() {
  return state.board && (state.board.created_by === state.me?.id || state.members.length <= 1 || state.board.can_delete === true);
}

function renderBoardActions() {
  $("#switchRow").hidden = true; $("#switchCode").value = "";
  const can = canDeleteBoard();
  $("#deleteBoardBtn").hidden = !can;
  const hint = $("#boardHint");
  hint.hidden = can;
  if (!can) hint.textContent = `Only ${ownerName()} (the owner) can delete this board. You can leave it instead.`;
}

async function switchBoard() {
  const code = $("#switchCode").value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (code.length < 8) return toast("Codes are 8 characters");
  if (code === state.board?.code) return toast("You're already on that board");
  if (!confirm(`Move to the other board? You'll leave this one${others().length ? " (everyone else keeps it)" : ""}.`)) return;
  const btn = $("#switchGo"); busy(btn, true, "…");
  const old = state.board;
  leaving = true;
  try {
    const next = await api.joinBoard(code);      // join first, so a bad code leaves you where you are
    await api.leaveBoard(old.id);
    resetBoardState();
    await openBoard((await api.myBoard()) || next);
    toast("Joined the new board 🎉");
  } catch (e) { toast(e.message, 4000); }
  finally { leaving = false; busy(btn, false); }
}

async function leaveBoard() {
  const os = others();
  const msg = os.length ? `Leave this board? ${os.length === 1 ? os[0].name : "Everyone else"} keeps it and everything on it. You'd need the code to come back.`
    : "Leave this board? Nobody else is on it, so you may want to delete it instead.";
  if (!confirm(msg)) return;
  leaving = true;
  try {
    await api.leaveBoard(state.board.id);
    resetBoardState();
    const other = await api.myBoard();
    other ? await openBoard(other) : await showMenu();
    toast("You left the board");
  } catch (e) { toast(e.message, 4000); }
  finally { leaving = false; }
}

async function deleteBoard() {
  const os = others();
  const n = state.notes.size;
  if (!confirm(`Delete this board for ${os.length ? `everyone (${os.length + 1} people)` : "good"}?\n\n${n} note${n === 1 ? "" : "s"} plus all photos, voice notes, drawings, messages and game scores will be erased. This can't be undone.`)) return;
  if (!confirm("Last check: delete everything and start over?")) return;
  const btn = $("#deleteBoardBtn"); busy(btn, true, "Deleting…");
  leaving = true;
  try {
    const gone = state.board.id;
    await api.deleteBoard(gone);
    fxMapChannel().send({ fx: "room-gone", room: gone });
    resetBoardState();
    const other = await api.myBoard();
    other ? await openBoard(other) : await showMenu();
    toast("Board deleted. Start a new one or join one from the map.", 4000);
  } catch (e) { toast(e.message, 5000); }
  finally { leaving = false; busy(btn, false); }
}

// ================================================================ messages (1-on-1 + group)
const chat = { peer: null, typingT: 0, typingShow: null };
const readKey = (u, p) => `${u}|${p}`;
const threadOf = (m) => (!m.to_id ? "group" : m.sender_id === state.me?.id ? m.to_id : m.sender_id);

async function loadChats() {
  try {
    const [msgs, reads] = await Promise.all([api.listMessages(state.board.id), api.listReads(state.board.id)]);
    const pending = state.msgs.filter((m) => m._pending);   // keep offline-queued messages until they send
    state.msgs = [...msgs, ...pending];
    state.reads = new Map(reads.map((r) => [readKey(r.user_id, r.peer), r.read_at]));
    await loadUrls(msgs);
    updateChatDot();
    if (!$("#chats").hidden) chat.peer ? renderThread() : renderThreadList();
  } catch { /* messages arrive with upgrade-v6.sql */ }
  loadFeedback(false);
}
async function refreshReads() {
  if (!state.board) return;
  try {
    const reads = await api.listReads(state.board.id);
    state.reads = new Map(reads.map((r) => [readKey(r.user_id, r.peer), r.read_at]));
    if (!$("#chats").hidden && chat.peer) renderThread();
  } catch { /* ignore */ }
}

function unreadIn(peer) {
  const last = state.reads.get(readKey(state.me.id, peer));
  return state.msgs.filter((m) => threadOf(m) === peer && m.sender_id !== state.me.id && (!last || m.created_at > last)).length;
}

function updateChatDot() {
  const peers = new Set(state.msgs.map(threadOf));
  $("#chatDot").hidden = !([...peers].some((p) => unreadIn(p) > 0) || feedbackUnread() > 0);
}

// ---------------------------------------------------------------- reply bar (chat)
function updateReplyBar() {
  const bar = $("#replyBar"); if (!bar) return;
  const par = chat.replyTo ? state.msgs.find((x) => x.id === chat.replyTo) : null;
  bar.hidden = !chat.replyTo;
  if (chat.replyTo) $("#replyBarText").textContent = `Replying to ${par ? (par.sender_id === state.me.id ? "yourself" : memberById(par.sender_id)?.name || "someone") : "a message"}${par && par.body ? ": " + par.body.slice(0, 60) : ""}`;
}

// ---------------------------------------------------------------- Feedback cycle (shared across all rooms)
const fb = { threads: [], posts: [], open: null, replyTo: null, view: "list", loaded: false, warned: false };
const FB_SEEN_KEY = "pinned.feedback.seen";
function fbSeen() { try { return localStorage.getItem(FB_SEEN_KEY) || ""; } catch { return ""; } }
function fbMarkSeen() {
  const latest = [...fb.threads, ...fb.posts].reduce((a, x) => (x.created_at > a ? x.created_at : a), "");
  try { localStorage.setItem(FB_SEEN_KEY, latest || new Date().toISOString()); } catch { /* storage blocked */ }
}
function feedbackUnread() {
  const seen = fbSeen();
  return [...fb.threads, ...fb.posts].filter((x) => !x.is_mine && x.created_at > seen).length;
}
async function loadFeedback(render = true) {
  if (!state.me) return;
  try {
    const [t, p] = await Promise.all([api.listFeedbackThreads(), api.listFeedbackPosts()]);
    fb.threads = t; fb.posts = p; fb.loaded = true;
    try { await ensureAvatars([...t, ...p].map((x) => ({ avatar_path: x.author_avatar }))); } catch { /* pictures are optional */ }
    if (!fbSeen()) fbMarkSeen();
  } catch (e) {
    if (!fb.warned && /relation|schema cache|does not exist/i.test(e.message || "")) { fb.warned = true; toast("Feedback needs upgrade-v21.sql in Supabase", 5000); }
  }
  if (render) { renderFeedback(); if (!$("#chats").hidden && !$("#chatList").hidden) renderThreadList(); }
  updateChatDot();
}
function feedbackRowEl() {
  const li = document.createElement("li"); li.className = "fb-row";
  const chip = document.createElement("span"); chip.className = "chip group"; chip.textContent = "📣";
  const info = document.createElement("div"); info.className = "tinfo";
  const nm = document.createElement("div"); nm.className = "tname"; const b = document.createElement("span"); b.textContent = "Feedback cycle"; nm.appendChild(b);
  const lt = document.createElement("div"); lt.className = "tlast";
  const live = fb.threads.filter((t) => !t.deleted_at).length;
  lt.textContent = `All rooms · ${live} thread${live === 1 ? "" : "s"}`;
  info.append(nm, lt); li.append(chip, info);
  const n = feedbackUnread();
  li.classList.toggle("unread", n > 0);
  if (n) { const d = document.createElement("i"); d.className = "udot"; li.appendChild(d); }
  li.onclick = openFeedback;
  return li;
}
function fbWho(item) {
  const w = el("span", "fb-who");
  if (item.anonymous) { w.append(el("span", "fb-mask", "🎭"), el("b", null, "Anonymous")); return w; }
  const url = item.author_avatar && state.urls[item.author_avatar];
  const av = el("span", "sc-av"); av.style.background = "#ffe066";
  if (url) av.style.backgroundImage = `url("${url.replace(/"/g, "%22")}")`; else av.textContent = (item.author_name || "?").slice(0, 1).toUpperCase();
  w.append(av, el("b", null, item.author_name || "Someone"));
  return w;
}
function openFeedback() {
  $("#chatList").hidden = true; $("#chatThread").hidden = true; $("#feedbackView").hidden = false;
  fb.open = null; fb.replyTo = null; fb.view = "list";
  renderFeedback();
  loadFeedback(true).then(() => { fbMarkSeen(); updateChatDot(); });
}
function closeFeedback() {
  fb.open = null; fb.view = "list"; $("#feedbackView").hidden = true; $("#chatList").hidden = false;
  renderThreadList();
}
function fbBack() {
  if (fb.view === "new") { fb.view = "list"; return renderFeedback(); }
  if (fb.open) { fb.open = null; fb.replyTo = null; return renderFeedback(); }
  closeFeedback();
}
function renderFeedback() {
  const v = $("#feedbackView"); if (v.hidden) return;
  if (fb.open) return renderFbThread();
  $("#fbTitle").textContent = "Feedback cycle";
  const live = fb.threads.filter((t) => !t.deleted_at).length;
  $("#fbSub").textContent = `All rooms · ${live} thread${live === 1 ? "" : "s"}`;
  $("#fbThreadWrap").hidden = true;
  $("#fbToolbar").hidden = false;
  $("#fbExport").hidden = false;
  $("#fbNew").hidden = fb.view !== "new";
  $("#fbList").hidden = fb.view === "new";
  $("#fbNewBtn").hidden = fb.view === "new";
  const list = $("#fbList"); list.innerHTML = "";
  if (!fb.threads.length) list.appendChild(el("p", "sc-empty", fb.loaded ? "No threads yet. Start the first one below." : "Loading…"));
  const seen = fbSeen();
  for (const t of fb.threads) {
    const b = el("button", "fb-item");
    if (t.deleted_at || t.is_hidden) b.classList.add("deleted");
    if (!t.is_mine && t.created_at > seen) b.classList.add("unread");
    const top = el("div", "fb-top"); top.append(fbWho(t), el("small", null, timeAgo(t.created_at)));
    const n = t.reply_count || 0;
    b.append(top, el("b", "fb-title", t.deleted_at ? "This post was deleted" : t.is_hidden ? "Hidden by moderators" : t.title), el("span", "fb-meta", `${n} repl${n === 1 ? "y" : "ies"}`));
    b.onclick = () => { fb.open = t.id; fb.replyTo = null; renderFeedback(); };
    list.appendChild(b);
  }
}
function renderFbThread() {
  const t = fb.threads.find((x) => x.id === fb.open);
  if (!t) { fb.open = null; return renderFeedback(); }
  $("#fbList").hidden = true; $("#fbNew").hidden = true; $("#fbNewBtn").hidden = true; $("#fbToolbar").hidden = true; $("#fbExport").hidden = true;
  $("#fbThreadWrap").hidden = false;
  $("#fbTitle").textContent = t.deleted_at ? "Deleted thread" : t.is_hidden ? "Hidden thread" : t.title;
  $("#fbSub").textContent = t.anonymous ? "Anonymous thread" : `Started by ${t.author_name || "someone"}`;
  const box = $("#fbPosts"); box.innerHTML = "";
  box.appendChild(fbCard(t, true));
  const replies = fb.posts.filter((p) => p.thread_id === t.id);
  if (!replies.length) box.appendChild(el("p", "msg-time", "No replies yet. Be the first."));
  for (const p of replies) box.appendChild(fbCard(p, false));
  fbUpdateReplyBar();
  box.scrollTop = 0;
}
function fbCard(item, isThread) {
  const card = el("div", "fb-card" + (isThread ? " fb-root" : "") + (item.deleted_at ? " deleted" : ""));
  const head = el("div", "fb-top"); head.append(fbWho(item), el("small", null, timeAgo(item.created_at)));
  card.appendChild(head);
  if (isThread && !item.deleted_at && !item.is_hidden) card.appendChild(el("b", "fb-title", item.title));
  card.appendChild(el("p", "fb-body", item.deleted_at ? "This post was deleted" : item.is_hidden ? "Hidden by moderators" : item.body));
  if (!item.deleted_at) {
    const acts = el("div", "fb-acts");
    if (!item.is_hidden) {
      const reply = el("button", null, "Reply"); reply.type = "button";
      reply.onclick = () => { fb.replyTo = isThread ? null : item.id; fbUpdateReplyBar(); $("#fbReplyInput").focus(); };
      acts.appendChild(reply);
    }
    if (item.is_mine) { const del = el("button", null, "Delete"); del.type = "button"; del.onclick = () => fbDelete(isThread ? "thread" : "post", item.id); acts.appendChild(del); }
    else if (!item.is_hidden) { const rep = el("button", null, "Report"); rep.type = "button"; rep.onclick = () => fbReport(isThread ? "thread" : "post", item.id); acts.appendChild(rep); }
    if (acts.childElementCount) card.appendChild(acts);
  }
  return card;
}
function fbUpdateReplyBar() {
  const par = fb.replyTo ? fb.posts.find((p) => p.id === fb.replyTo) : null;
  $("#fbReplyBar").hidden = false;
  $("#fbReplyBar").hidden = !fb.replyTo;
  if (fb.replyTo) $("#fbReplyText").textContent = `Replying to ${par ? (par.anonymous ? "Anonymous" : par.author_name || "someone") : "a reply"}`;
}
async function fbSend() {
  const body = $("#fbReplyInput").value.trim(); if (!body || !fb.open) return;
  const btn = $("#fbReplySend"); busy(btn, true, "…");
  try {
    await api.replyFeedback(fb.open, fb.replyTo, body, $("#fbReplyAnon").checked);
    $("#fbReplyInput").value = ""; fb.replyTo = null;
    haptic(10);
    await loadFeedback(true);
  } catch (e) { toast(e.message || "Couldn't post that", 5000); }
  busy(btn, false);
}
async function fbPostNew() {
  const title = $("#fbNewTitle").value.trim(), body = $("#fbNewBody").value.trim();
  if (!title || !body) return toast("Add a title and a message first");
  const btn = $("#fbNewPost"); busy(btn, true, "Posting…");
  try {
    await api.newFeedbackThread(title, body, $("#fbNewAnon").checked);
    $("#fbNewTitle").value = ""; $("#fbNewBody").value = ""; $("#fbNewAnon").checked = false;
    fb.view = "list"; haptic(10);
    await loadFeedback(true); toast("Posted to Feedback cycle");
  } catch (e) { toast(e.message || "Couldn't post that", 5000); }
  busy(btn, false);
}
async function fbDelete(kind, id) {
  if (!confirm("Delete this? Others will see that it was deleted.")) return;
  try { await api.deleteFeedback(kind, id); toast("Deleted"); await loadFeedback(true); }
  catch (e) { toast(e.message || "Couldn't delete that", 5000); }
}
async function fbReport(kind, id) {
  const reason = prompt("Why are you reporting this? (short)");
  if (!reason || !reason.trim()) return;
  try { await api.reportFeedback(kind, id, reason.trim().slice(0, 200)); toast("Thanks, we'll look at it"); }
  catch (e) { toast(e.message || "Couldn't send the report", 5000); }
}
function fbCsvCell(v) { const s = v == null ? "" : String(v); return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
function fbExportCsv() {
  const from = $("#fbFrom").value, to = $("#fbTo").value;
  const inRange = (iso) => { const d = (iso || "").slice(0, 10); return (!from || d >= from) && (!to || d <= to); };
  const titleOf = new Map(fb.threads.map((t) => [t.id, t.title]));
  const author = (x) => (x.anonymous ? "Anonymous" : x.author_name || "");
  const rows = [["type", "thread_title", "body", "posted_at", "author", "reply_to_id"]];
  for (const t of fb.threads) if (!t.deleted_at && !t.is_hidden && inRange(t.created_at)) rows.push(["thread", t.title, t.body, t.created_at, author(t), ""]);
  for (const p of fb.posts) if (!p.deleted_at && !p.is_hidden && inRange(p.created_at)) rows.push(["reply", titleOf.get(p.thread_id) || "", p.body, p.created_at, author(p), p.parent_post_id || ""]);
  const csv = "﻿" + rows.map((r) => r.map(fbCsvCell).join(",")).join("\r\n") + "\r\n";
  const a = document.createElement("a");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.href = url; a.download = `pinned-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  toast(`Exported ${rows.length - 1} row${rows.length === 2 ? "" : "s"}`);
}

// ---------------------------------------------------------------- moderation (feedback admins only)
async function renderModRow() {
  try { $("#modOpen").hidden = !(await api.isFeedbackAdmin()); }
  catch { $("#modOpen").hidden = true; }
}
async function openModeration() {
  closeSheet("settings");
  openChats();
  $("#chatList").hidden = true; $("#chatThread").hidden = true; $("#feedbackView").hidden = true;
  $("#modView").hidden = false;
  await loadMod();
}
function closeModeration() { $("#modView").hidden = true; $("#chatList").hidden = false; renderThreadList(); }
async function loadMod() {
  const list = $("#modList"); list.innerHTML = "";
  list.appendChild(el("p", "sc-empty", "Loading…"));
  let rows;
  try { rows = await api.adminListReports(); }
  catch (e) { list.innerHTML = ""; list.appendChild(el("p", "sc-empty", e.message || "Couldn't load reports")); return; }
  list.innerHTML = "";
  $("#modSub").textContent = `${rows.length} post${rows.length === 1 ? "" : "s"} to review`;
  if (!rows.length) list.appendChild(el("p", "sc-empty", "No open reports."));
  for (const r of rows) list.appendChild(modCard(r));
}
function modCard(r) {
  const card = el("div", "fb-card" + (r.hidden ? " deleted" : ""));
  const head = el("div", "fb-top");
  head.append(el("b", null, r.kind === "thread" ? "Thread" : "Reply"), el("small", null, `${r.count} report${r.count === 1 ? "" : "s"}`));
  card.appendChild(head);
  if (r.title) card.appendChild(el("b", "fb-title", r.title));
  card.appendChild(el("p", "fb-body", r.body || "(no text)"));
  card.appendChild(el("small", "fb-meta", r.anonymous ? "Anonymous author (hidden from moderators)" : `By ${r.author_name || "someone"}`));
  const reasons = el("ul", "mod-reasons");
  for (const x of r.reasons) reasons.appendChild(el("li", null, x));
  card.appendChild(reasons);
  card.appendChild(el("small", "fb-meta", `First report ${timeAgo(r.first_reported)}${r.hidden ? " · Currently hidden" : ""}`));
  const acts = el("div", "fb-acts");
  const main = el("button", null, r.hidden ? "Restore" : "Hide");
  main.type = "button"; main.onclick = () => modAct(r.hidden ? "restore" : "hide", r);
  const dis = el("button", null, "Dismiss reports"); dis.type = "button"; dis.onclick = () => modAct("dismiss", r);
  acts.append(main, dis); card.appendChild(acts);
  return card;
}
async function modAct(action, r) {
  try {
    if (action === "hide") await api.adminHide(r.kind, r.target_id);
    else if (action === "restore") await api.adminRestore(r.kind, r.target_id);
    else await api.adminDismiss(r.kind, r.target_id);
    toast(action === "hide" ? "Hidden from everyone" : action === "restore" ? "Restored" : "Reports dismissed");
    await loadMod(); await loadFeedback(true);
  } catch (e) { toast(e.message || "Couldn't do that", 5000); }
}

function openChats() {
  chat.peer = null; $("#feedbackView").hidden = true; $("#modView").hidden = true; chat.replyTo = null; updateReplyBar();
  $("#chatList").hidden = false; $("#chatThread").hidden = true;
  renderThreadList();
  openSheet("chats");
}

function renderThreadList() {
  const ul = $("#threadList"); ul.innerHTML = "";
  ul.appendChild(feedbackRowEl());
  const rows = [{ peer: "group", name: "Everyone", sub: `${state.members.length} people` },
    ...others().map((m) => ({ peer: m.id, name: m.name, m }))];
  const lastOf = (p) => { const list = state.msgs.filter((x) => threadOf(x) === p); return list[list.length - 1]; };
  rows.sort((x, y) => (x.peer === "group" ? -1 : y.peer === "group" ? 1 : ((lastOf(y.peer)?.created_at || "") > (lastOf(x.peer)?.created_at || "") ? 1 : -1)));
  for (const r of rows) {
    const li = document.createElement("li");
    const last = lastOf(r.peer), unread = unreadIn(r.peer);
    li.classList.toggle("unread", unread > 0);
    let chip;
    if (r.m) chip = chipEl(r.m);
    else { chip = document.createElement("span"); chip.className = "chip group"; chip.textContent = "👥"; }
    li.appendChild(chip);
    const info = document.createElement("div"); info.className = "tinfo";
    const nm = document.createElement("div"); nm.className = "tname";
    const b = document.createElement("span"); b.textContent = r.name; nm.appendChild(b);
    if (last) { const t = document.createElement("small"); t.textContent = timeAgo(last.created_at); nm.appendChild(t); }
    const lt = document.createElement("div"); lt.className = "tlast";
    lt.textContent = last ? `${last.sender_id === state.me.id ? "You: " : r.peer === "group" ? (memberById(last.sender_id)?.name || "Someone") + ": " : ""}${last.body || "📷 Photo"}` : r.peer === "group" ? "Group chat for the whole board" : "Say hi 👋";
    info.append(nm, lt); li.appendChild(info);
    if (unread) { const d = document.createElement("i"); d.className = "udot"; li.appendChild(d); }
    li.onclick = () => openThread(r.peer);
    ul.appendChild(li);
  }
}

function openThread(peer) {
  chat.peer = peer; chat.replyTo = null; updateReplyBar();
  $("#chatList").hidden = true; $("#chatThread").hidden = false;
  const m = memberById(peer);
  $("#threadName").textContent = peer === "group" ? "Everyone" : m?.name || "Chat";
  $("#threadSub").textContent = peer === "group" ? `Group chat · ${state.members.length} people` : isOnline(peer) ? "Online" : m?.last_seen ? `Last seen ${timeAgo(m.last_seen)}` : "";
  $("#threadTyping").hidden = true;
  renderThread();
  markThreadRead();
  setTimeout(() => $("#msgInput").focus(), 200);
}

function renderThread() {
  const box = $("#msgList"); box.innerHTML = "";
  const list = state.msgs.filter((x) => threadOf(x) === chat.peer);
  if (!list.length) { const p = document.createElement("p"); p.className = "msg-time"; p.textContent = chat.peer === "group" ? "Say something to everyone 👋" : "No messages yet"; box.appendChild(p); }
  let lastTime = 0;
  for (const m of list) {
    const t = new Date(m.created_at).getTime();
    if (t - lastTime > 30 * 60 * 1000) {
      const d = document.createElement("div"); d.className = "msg-time";
      d.textContent = new Date(m.created_at).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" });
      box.appendChild(d);
    }
    lastTime = t;
    const el = document.createElement("div");
    el.className = "msg" + (m.sender_id === state.me.id ? " mine" : "") + (m._pending ? " pending" : "");
    if (chat.peer === "group" && m.sender_id !== state.me.id) { const by = document.createElement("span"); by.className = "by"; by.textContent = memberById(m.sender_id)?.name || "Someone"; el.appendChild(by); }
    if (m.reply_to) {
      const par = state.msgs.find((x) => x.id === m.reply_to);
      const q = document.createElement("div"); q.className = "quote";
      q.textContent = par ? `${par.sender_id === state.me.id ? "You" : memberById(par.sender_id)?.name || "Someone"}: ${(par.body || "📷 Photo").slice(0, 80)}` : "Original message";
      el.appendChild(q);
    }
    if (m.media_path) { const img = document.createElement("img"); img.alt = "Photo"; img.src = state.urls[m.media_path] || ""; el.appendChild(img); }
    if (m.body) el.appendChild(document.createTextNode(m.body));
    if (!m._pending) {
      const rb = document.createElement("button"); rb.type = "button"; rb.className = "msg-reply"; rb.textContent = "↩ Reply";
      rb.onclick = (e) => { e.stopPropagation(); chat.replyTo = m.id; updateReplyBar(); $("#msgInput").focus(); };
      el.appendChild(rb);
    }
    box.appendChild(el);
  }
  // read receipt under your last message
  const mineLast = [...list].reverse().find((m) => m.sender_id === state.me.id);
  if (mineLast && list[list.length - 1] === mineLast) {
    let txt = "";
    if (chat.peer === "group") {
      const n = others().filter((o) => (state.reads.get(readKey(o.id, "group")) || "") >= mineLast.created_at).length;
      if (n) txt = n === others().length ? "Seen by everyone" : `Seen by ${n}`;
    } else if ((state.reads.get(readKey(chat.peer, state.me.id)) || "") >= mineLast.created_at) txt = "Seen";
    if (txt) { const s = document.createElement("div"); s.className = "msg-seen"; s.textContent = "✓ " + txt; box.appendChild(s); }
  }
  box.scrollTop = box.scrollHeight;
}

let readT = null;
function markThreadRead() {
  if (!chat.peer || $("#chats").hidden || document.visibilityState !== "visible") return;
  clearTimeout(readT);
  readT = setTimeout(async () => {
    const peer = chat.peer; if (!peer) return;
    state.reads.set(readKey(state.me.id, peer), new Date().toISOString());
    updateChatDot();
    try { await api.markRead(state.board.id, peer); } catch { /* v6 */ }
  }, 300);
}

async function sendChat(photo = null) {
  const body = $("#msgInput").value.trim();
  if (!body && !photo) return;
  const peer = chat.peer; if (!peer) return;
  const btn = $("#msgSend"); busy(btn, true, "…");
  try {
    const row = { board_id: state.board.id, sender_id: state.me.id, to_id: peer === "group" ? null : peer, body: body || null, ...(chat.replyTo ? { reply_to: chat.replyTo } : {}) };
    if (photo) {
      row.media_path = await api.uploadMedia(state.board.id, photo, "jpg");
      state.urls[row.media_path] = URL.createObjectURL(photo);
    }
    const saved = await api.sendMessage(row);
    $("#msgInput").value = "";
    chat.replyTo = null; updateReplyBar();
    haptic(10);
    onMessageEvent(saved);
    api.notify(state.board.id, "message", peer === "group" ? {} : { to: peer });
  } catch (e) {
    console.warn(e);
    const row = { board_id: state.board.id, sender_id: state.me.id, to_id: peer === "group" ? null : peer, body: body || null, ...(chat.replyTo ? { reply_to: chat.replyTo } : {}) };
    if (isNetworkError(e) && !photo && body) {
      const tempId = uid();
      $("#msgInput").value = "";
      onMessageEvent({ ...row, id: tempId, _pending: true, created_at: new Date().toISOString() });
      queueMsg(row, tempId);
      updateConn();
      toast("Offline — your message will send when you're back ⏳", 3000);
    }
    else if (/relation|schema cache|does not exist/i.test(e.message || "")) toast("Messages need upgrade-v6.sql in Supabase", 4000);
    else toast("Couldn't send that message", 7000, { label: "Retry", fn: () => sendChat(photo) });
  }
  busy(btn, false);
}

async function onMessageEvent(m) {
  if (state.msgs.some((x) => x.id === m.id)) return;
  state.msgs.push(m);
  if (m.media_path && !state.urls[m.media_path]) await loadUrls([m]);
  const peer = threadOf(m);
  const open = !$("#chats").hidden;
  if (open && chat.peer === peer) { renderThread(); if (m.sender_id !== state.me.id) markThreadRead(); }
  else if (open && !chat.peer) renderThreadList();
  if (m.sender_id !== state.me.id && !(open && chat.peer === peer)) {
    const who = memberById(m.sender_id)?.name || "Someone";
    toast(`${peer === "group" ? who + " (group)" : who}: ${(m.body || "📷 Photo").slice(0, 60)}`, 3500);
  }
  if (m.sender_id !== state.me.id && chat.peer === peer) { $("#threadTyping").hidden = true; }
  updateChatDot();
}

function onReadEvent(r) {
  if (!r?.user_id) return;
  state.reads.set(readKey(r.user_id, r.peer), r.read_at);
  if (!$("#chats").hidden && chat.peer) renderThread();
}

function sendTyping() {
  const now = Date.now();
  if (!chat.peer || now - chat.typingT < 2000) return;
  chat.typingT = now;
  live?.send({ t: "typing", u: state.me.id, to: chat.peer });
}

function onTyping(m) {
  if (m.u === state.me?.id || $("#chats").hidden) return;
  const forMe = (chat.peer === "group" && m.to === "group") || (chat.peer === m.u && m.to === state.me.id);
  if (!forMe) return;
  const el = $("#threadTyping");
  el.textContent = `${memberById(m.u)?.name || "Someone"} is typing…`;
  el.hidden = false;
  clearTimeout(chat.typingShow);
  chat.typingShow = setTimeout(() => (el.hidden = true), 3500);
}

// ================================================================ backgrounds
const BG_COLORS = ["#f4efe6", "#ffe3ec", "#e3f0ff", "#e6f7e9", "#efe6ff", "#1b1d24", "#2b3a55", "#5b3a29"];
const MAX_BG_BYTES = 10 * 1024 * 1024;

function isOwner() { return state.board?.created_by === state.me?.id; }
function effectiveBg() {
  if (!state.board) return null;
  return (state.board.bg_mode === "personal" ? state.board.my_bg : state.board.bg) || null;
}

function clearBgLayer() { const l = $("#bgLayer"); l.innerHTML = ""; l.style.background = ""; l.style.backgroundImage = ""; delete l.dataset.key; }

async function applyBackground() {
  const bg = effectiveBg(), l = $("#bgLayer");
  const key = bg ? JSON.stringify(bg) : "";
  if (l.dataset.key === key) return;
  clearBgLayer(); l.dataset.key = key;
  if (!bg) return;
  if (bg.type === "color") { l.style.background = bg.value; return; }
  if (!bg.path) return;
  if (!state.urls[bg.path]) Object.assign(state.urls, await api.mediaUrls([bg.path]));
  const url = state.urls[bg.path]; if (!url) return;
  if (bg.type === "video") {
    const v = document.createElement("video");
    v.muted = true; v.defaultMuted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
    v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("webkit-playsinline", "");
    v.disablePictureInPicture = true; v.controls = false; v.src = url;
    l.appendChild(v);
    v.play().catch(() => {});
  } else {
    l.style.backgroundImage = `url("${url.replace(/"/g, "%22")}")`;
  }
}

function onBoardEvent(row) {
  if (!state.board || row.id !== state.board.id) return;
  const modeChanged = row.bg_mode !== state.board.bg_mode;
  Object.assign(state.board, { bg_mode: row.bg_mode, bg: row.bg, created_by: row.created_by, name: row.name ?? null, photo_path: row.photo_path ?? null, locked: !!row.locked, listed: row.listed !== false });
  if (row.can_delete !== undefined) state.board.can_delete = !!row.can_delete;
  applyBackground();
  if (modeChanged && !isOwner()) toast(row.bg_mode === "personal" ? "You can now pick your own background in Settings" : "The board has a shared background again");
  if (!$("#settings").hidden) renderBgSettings();
  ensureRoomPhoto();   // also refreshes the header and the room sheet
}

// ---------------------------------------------------------------- room name, photo and lock
const LOCKED_MSG = "This room is locked. Ask the people inside to unlock it.";
const ROOM_NAME_MAX = 40;

function renderRoomHead() {
  const b = state.board; if (!b) return;
  $("#rhName").textContent = (b.name || "").trim() || "Our room";
  $("#rhLock").hidden = !b.locked;
  const url = b.photo_path && state.urls[b.photo_path];
  const ph = $("#rhPhoto");
  ph.style.backgroundImage = url ? `url("${url.replace(/"/g, "%22")}")` : "";
  ph.textContent = url ? "" : "🏠";
}
async function ensureRoomPhoto() {
  const p = state.board?.photo_path;
  if (p && !state.urls[p]) { try { Object.assign(state.urls, await api.mediaUrls([p])); } catch { /* shown without a photo */ } }
  renderRoomHead();
  if (!$("#roomSheet").hidden) renderRoomSheet();
}
function renderRoomSheet() {
  const b = state.board; if (!b) return;
  $("#rsNameShow").textContent = (b.name || "").trim() || "Our room";
  $("#rsCode").textContent = "Code " + fmtCode(b.code);
  $("#rsLockText").textContent = b.locked ? "Unlock room" : "Lock room";
  const owner = !!state.me && b.created_by === state.me.id;
  $("#rsListed").hidden = !owner;
  $("#rsListedText").textContent = b.listed === false ? "Show on the room map" : "Hide from the room map";
  $("#rsAdmin").disabled = owner;
  $("#rsAdminText").textContent = owner ? "You're the admin" : "Take admin";
  $("#rsRemovePhoto").hidden = !b.photo_path;
  const url = b.photo_path && state.urls[b.photo_path];
  const p = $("#rsPhoto");
  p.style.backgroundImage = url ? `url("${url.replace(/"/g, "%22")}")` : "";
  p.textContent = url ? "" : "🏠";
}
function openRoomSheet() {
  if (!state.board) return;
  $("#rsName").value = (state.board.name || "").trim();
  renderRoomSheet();
  openSheet("roomSheet");
}
// runs one room change and shows the error if it fails
async function roomChange(fn, okMsg) {
  try { await fn(); if (okMsg) toast(okMsg); }
  catch (e) { toast(e.message || "Couldn't save that"); }
}

async function loadBgRequests() {
  try { state.bgReqs = await api.listBgRequests(state.board.id); } catch { state.bgReqs = []; }
  updateGearDot();
}

function updateGearDot() { $("#gearDot").hidden = !(isOwner() && state.bgReqs.some((r) => r.status === "pending")); }

function onBgRequestEvent(r) {
  const i = state.bgReqs.findIndex((x) => x.id === r.id);
  const prev = i >= 0 ? state.bgReqs[i] : null;
  if (i >= 0) state.bgReqs[i] = r; else state.bgReqs.unshift(r);
  if (isOwner() && r.status === "pending" && !prev && r.user_id !== state.me.id) toast(`${memberById(r.user_id)?.name || "Someone"} suggested a background. Open Settings to see it 🖼️`, 4500);
  if (r.user_id === state.me.id && prev?.status === "pending" && r.status !== "pending") toast(r.status === "approved" ? "Your background was approved 🎉" : "The owner passed on your background idea", 4500);
  updateGearDot();
  if (!$("#settings").hidden) renderBgSettings();
}

function renderBgSettings() {
  const owner = isOwner(), mode = state.board?.bg_mode || "shared";
  const canSetOwn = owner || mode === "personal";
  const segEl = $("#bgMode");
  segEl.hidden = !owner;
  segEl.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
  const info = $("#bgInfo");
  if (owner) info.textContent = mode === "shared" ? "Everyone sees the background you pick. Members can suggest an image or GIF for you to approve." : "Everyone picks their own background. Yours is below.";
  else info.textContent = mode === "shared" ? `${ownerName()} picks the shared background. You can suggest an image or GIF.` : "Pick your own background. Only you see it.";
  // colors
  const cur = effectiveBg();
  const colors = $("#bgColors"); colors.innerHTML = ""; colors.hidden = !canSetOwn;
  for (const c of BG_COLORS) {
    const b = document.createElement("button"); b.type = "button"; b.style.background = c; b.setAttribute("aria-label", "Background color " + c);
    b.setAttribute("aria-pressed", String(cur?.type === "color" && cur.value === c));
    b.onclick = () => setBackground({ type: "color", value: c });
    colors.appendChild(b);
  }
  const lbl = $("#bgFileLbl"), file = $("#bgFile");
  if (canSetOwn) { lbl.textContent = owner ? "Upload image, GIF or video" : "Upload image or GIF"; file.accept = owner ? "image/*,video/mp4,video/webm,video/quicktime" : "image/*"; }
  else { lbl.textContent = "Suggest an image or GIF"; file.accept = "image/*"; }
  $("#bgClear").hidden = !canSetOwn || !cur;
  // requests
  const box = $("#bgRequests"); box.innerHTML = "";
  const list = owner ? state.bgReqs.filter((r) => r.status === "pending") : state.bgReqs.filter((r) => r.user_id === state.me.id).slice(0, 3);
  if (list.length) {
    const paths = list.map((r) => r.media_path).filter((p) => !state.urls[p]);
    if (paths.length) api.mediaUrls(paths).then((u) => { Object.assign(state.urls, u); box.querySelectorAll("img[data-p]").forEach((im) => (im.src = state.urls[im.dataset.p] || "")); });
  }
  for (const r of list) {
    const row = document.createElement("div"); row.className = "bgreq";
    const img = document.createElement("img"); img.alt = "Suggested background"; img.dataset.p = r.media_path; img.src = state.urls[r.media_path] || "";
    const who = document.createElement("span"); who.className = "who";
    who.textContent = owner ? `${memberById(r.user_id)?.name || "Someone"} suggested this` : "Your suggestion";
    const sm = document.createElement("small"); sm.textContent = owner ? timeAgo(r.created_at) : { pending: "Waiting for the owner", approved: "Approved 🎉", declined: "Not this time" }[r.status];
    who.appendChild(sm);
    row.append(img, who);
    if (owner) {
      const acts = document.createElement("div"); acts.className = "acts";
      const ok = document.createElement("button"); ok.className = "btn small primary"; ok.textContent = "Approve"; ok.onclick = () => reviewBg(r, true);
      const no = document.createElement("button"); no.className = "btn small"; no.textContent = "Decline"; no.onclick = () => reviewBg(r, false);
      acts.append(ok, no); row.appendChild(acts);
    }
    box.appendChild(row);
  }
}

async function setBackground(bg) {
  try {
    if (isOwner() && state.board.bg_mode !== "personal") { await api.setBoardBg(state.board.id, null, bg, true); state.board.bg = bg; }
    else { await api.setMyBg(state.board.id, bg); state.board.my_bg = bg; }
    applyBackground(); renderBgSettings();
  } catch (e) { bgError(e); }
}

async function setBgMode(mode) {
  if (!isOwner() || mode === state.board.bg_mode) return;
  try { await api.setBoardBg(state.board.id, mode, null, false); state.board.bg_mode = mode; applyBackground(); renderBgSettings(); }
  catch (e) { bgError(e); }
}

function bgError(e) {
  const m = e?.message || "";
  if (/function|schema cache|column|does not exist/i.test(m)) toast("Backgrounds need upgrade-v6.sql in Supabase", 4000);
  else if (/mime|type|size|large/i.test(m)) toast("That file type or size isn't allowed (10 MB max)", 4000);
  else toast(m || "Couldn't change the background");
}

function videoDuration(file) {
  return new Promise((res) => {
    const v = document.createElement("video"); v.preload = "metadata"; v.muted = true;
    const url = URL.createObjectURL(file);
    v.onloadedmetadata = () => { URL.revokeObjectURL(url); res(v.duration); };
    v.onerror = () => { URL.revokeObjectURL(url); res(NaN); };
    v.src = url;
  });
}

async function onBgFile(file) {
  if (!file) return;
  const owner = isOwner(), mode = state.board.bg_mode || "shared";
  const isVideo = /^video\//.test(file.type), isGif = file.type === "image/gif", isImage = /^image\//.test(file.type);
  if (!isVideo && !isImage) return toast("Pick an image, GIF or video");
  if (isVideo && !owner) return toast("Only the owner can use a video background");
  if (file.size > MAX_BG_BYTES) return toast("That file is over 10 MB. Try a smaller one.");
  const lbl = $("#bgFileLbl"); const old = lbl.textContent; lbl.textContent = "Uploading…";
  try {
    let blob = file, ext = isGif ? "gif" : "jpg", type = isGif ? "gif" : "image";
    if (isVideo) {
      const d = await videoDuration(file);
      if (isFinite(d) && d > 15.5) { lbl.textContent = old; return toast("Videos can be up to 15 seconds"); }
      ext = (file.type.split("/")[1] || "mp4").replace("quicktime", "mov"); type = "video";
    } else if (!isGif) blob = await compressImage(file, 1920, 0.85);
    const path = await api.uploadMedia(state.board.id, blob, ext);
    state.urls[path] = URL.createObjectURL(blob);
    if (!owner && mode === "shared") {
      const r = await api.requestBg(state.board.id, path, type === "gif" ? "gif" : "image");
      onBgRequestEvent(r);
      api.notify(state.board.id, "bgrequest");
      toast(`Sent to ${ownerName()} for approval 🖼️`);
    } else await setBackground({ type, path });
  } catch (e) { bgError(e); }
  lbl.textContent = old; renderBgSettings();
}

async function reviewBg(r, approve) {
  try {
    await api.reviewBg(r.id, approve);
    r.status = approve ? "approved" : "declined";
    if (approve) { state.board.bg = { type: r.kind, path: r.media_path }; if (state.board.bg_mode === "personal") toast("Approved. Switch to Shared so everyone sees it."); applyBackground(); }
    api.notify(state.board.id, "bgreply", { to: r.user_id, approved: approve });
    updateGearDot(); renderBgSettings();
    toast(approve ? "Background updated for everyone" : "Declined");
  } catch (e) { bgError(e); }
}

// ================================================================ music / link cards
function parseLink(raw) {
  let u; try { u = new URL(raw.trim()); } catch { return null; }
  if (!/^https?:$/.test(u.protocol)) return null;
  const h = u.hostname.replace(/^www\.|^m\./, ""), p = u.pathname;
  let m;
  if (/(^|\.)youtube\.com$/.test(h) || h === "youtu.be" || h === "music.youtube.com") {
    const list = u.searchParams.get("list");
    const id = h === "youtu.be" ? p.slice(1).split("/")[0] : u.searchParams.get("v") || (p.match(/\/(?:shorts|embed|live)\/([\w-]{6,})/) || [])[1];
    if (id) return { provider: "YouTube", icon: "▶️", embed: `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1${list ? "&list=" + list : ""}`, h: 124 };
    if (list) return { provider: "YouTube", icon: "▶️", embed: `https://www.youtube.com/embed/videoseries?list=${list}&autoplay=1&playsinline=1`, h: 124 };
  }
  if (h === "open.spotify.com" && (m = p.match(/\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]+)/)))
    return { provider: "Spotify", icon: "🎧", embed: `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=pinned`, h: m[1] === "track" || m[1] === "episode" ? 152 : 232 };
  if (h === "music.apple.com" || h === "embed.music.apple.com")
    return { provider: "Apple Music", icon: "🎵", embed: `https://embed.music.apple.com${p}${u.search}`, h: u.searchParams.get("i") || /\/song\//.test(p) ? 175 : 300 };
  if (h === "soundcloud.com" || h === "on.soundcloud.com")
    return { provider: "SoundCloud", icon: "☁️", embed: `https://w.soundcloud.com/player/?url=${encodeURIComponent(u.href)}&auto_play=true&visual=false&hide_related=true`, h: 166 };
  return { provider: h, icon: "🔗", embed: null, h: 0 };
}

function buildLinkCard(n, el, inDetail = false) {
  const md = n.meta || {};
  const playing = !inDetail && state.playing === n.id && md.embed;
  if (playing) {
    const f = document.createElement("iframe");
    f.src = md.embed; f.height = md.h || 152; f.allow = "autoplay; encrypted-media; clipboard-write; picture-in-picture"; f.loading = "lazy";
    f.setAttribute("allowfullscreen", ""); f.title = md.title || md.provider;
    el.appendChild(f);
    const stop = document.createElement("span"); stop.className = "lk-stop"; stop.textContent = "■ Stop";
    el.appendChild(stop);
  } else {
    const cover = document.createElement("div"); cover.className = "lk-cover" + (md.thumb ? "" : " none");
    cover.dataset.icon = md.icon || "🎵";
    if (md.thumb) cover.style.backgroundImage = `url("${String(md.thumb).replace(/"/g, "%22")}")`;
    const badge = document.createElement("span"); badge.className = "lk-badge"; badge.textContent = md.provider || "Link"; cover.appendChild(badge);
    const btn = document.createElement("span"); btn.className = md.embed ? "lk-play" : "lk-open"; btn.textContent = md.embed ? "▶" : "↗";
    if (inDetail) btn.onclick = () => (md.embed ? null : window.open(md.url, "_blank", "noopener"));
    cover.appendChild(btn);
    el.appendChild(cover);
  }
  const t = document.createElement("div"); t.className = "lk-title"; t.textContent = md.title || md.url || "Link"; el.appendChild(t);
  if (md.author) { const s = document.createElement("div"); s.className = "lk-sub"; s.textContent = md.author; el.appendChild(s); }
}

function playCard(id) {
  const prev = state.playing;
  state.playing = state.playing === id ? null : id;
  for (const pid of [prev, state.playing]) { if (!pid) continue; const n = state.notes.get(pid), el = noteEl(pid); if (n && el) { buildNoteContent(n, el); placeNote(el, n); } }
}

let linkTimer = null, linkMeta = null;
function onLinkInput() {
  clearTimeout(linkTimer);
  linkTimer = setTimeout(async () => {
    const raw = $("#linkInput").value.trim();
    const box = $("#linkPreview"); box.innerHTML = "";
    linkMeta = null;
    const info = parseLink(raw);
    if (!info) return;
    linkMeta = { url: new URL(raw).href, ...info, title: null, thumb: null, author: null };
    const draw = () => { box.innerHTML = ""; const el = document.createElement("div"); el.className = "note link"; buildLinkCard({ id: "preview", meta: linkMeta }, el, true); box.appendChild(el); };
    draw();
    const u = await api.unfurl(linkMeta.url);
    if (linkMeta && linkMeta.url === new URL($("#linkInput").value.trim() || "about:blank").href) {
      Object.assign(linkMeta, { title: u.title || linkMeta.title, thumb: u.thumb || null, author: u.author || (info.embed ? info.provider : null) });
      draw();
    }
  }, 350);
}

// ---------------------------------------------------------------- settings
function openSettings() {
  // themes
  renderThemePicker();
  if (api.hasSession()) syncThemes().catch(() => {});
  $("#settingsCode").textContent = fmtCode(state.board?.code);
  $("#settingsName").value = state.me?.name || "";
  swatchRow($("#settingsSwatches"), state.me?.color, async (c) => {
    state.me.color = c;
    try { await api.updateProfile({ color: c }); await refreshMembers(); } catch (e) { toast(e.message); }
  }, "bright");
  renderMemberList();
  renderNotifStatus();
  renderMutes();
  renderAccount();
  renderBoardActions();
  renderBgSettings();
  $("#vibeSwitch").setAttribute("aria-checked", String(hapticsOn !== false));
  $("#vibeRow").hidden = !canVibrate;
  renderFeelSwitches();
  renderAbout();
  $("#appVersion").textContent = `Pinned · ${APP_VERSION}${isStandalone() ? " · installed" : ""}`;
  // avatar + bio
  const av = state.me?.avatar_path && state.urls[state.me.avatar_path];
  const ap = $("#avatarPreview");
  if (av) { ap.style.backgroundImage = `url("${av}")`; ap.textContent = ""; }
  else { ap.style.backgroundImage = ""; ap.style.background = BRIGHT[state.me?.color] || BRIGHT.c1; ap.textContent = (state.me?.name || "?").slice(0, 1).toUpperCase(); }
  $("#settingsBio").value = state.me?.bio || "";
  $("#bioCount").textContent = `${(state.me?.bio || "").length}/300`;
  openSheet("settings");
}


// ================================================================ Spatial voice chat (WebRTC mesh + Web Audio)
const ICE = [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:global.stun.twilio.com:3478" }];
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
// read-only voice diagnostics (handy for "why won't it connect?")
if (typeof window !== "undefined") window.voiceStatus = () => ({ on: voice.on, muted: voice.muted, micEnabled: voice.mic?.getAudioTracks?.()[0]?.enabled, peers: [...voice.peers.values()].map((p) => ({ id: p.id, state: p.pc.connectionState, ice: p.pc.iceConnectionState, stream: !!p.stream, panner: !!p.panner })) });
const voice = { on: false, ctx: null, mic: null, master: null, convolver: null, wetGain: null, peers: new Map(), muted: false, posT: 0, speakT: 0, raf: 0 };
const myVoiceId = () => state.me?.id || "";

function hallImpulse(ctx, seconds = 1.8, decay = 2.6) {
  const rate = ctx.sampleRate, len = Math.floor(rate * seconds);
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
  return buf;
}

async function joinVoice() {
  if (voice.on) return;
  try {
    voice.mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false });
  } catch (e) { toast(e && e.name === "NotAllowedError" ? "Microphone blocked — allow it in your phone's settings" : "Couldn't get the microphone"); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  voice.ctx = new AC();
  if (voice.ctx.state === "suspended") await voice.ctx.resume();
  voice.master = voice.ctx.createGain(); voice.master.gain.value = 1; voice.master.connect(voice.ctx.destination);
  voice.convolver = voice.ctx.createConvolver(); voice.convolver.buffer = hallImpulse(voice.ctx);
  voice.wetGain = voice.ctx.createGain(); voice.wetGain.gain.value = 0.18;   // gentle hall, not too intense
  voice.convolver.connect(voice.wetGain); voice.wetGain.connect(voice.master);
  try { const L = voice.ctx.listener; if (L.positionX) { L.positionX.value = 0; L.positionY.value = 0; L.positionZ.value = 0; } } catch { /* ignore */ }
  voice.on = true; voice.muted = false;
  live?.track?.({ voice: true, vmuted: false });
  live?.send({ t: "vjoin", u: myVoiceId() });
  // connect to anyone already in voice (from presence)
  for (const m of others()) if (state.presence[m.id]?.voice) ensurePeer(m.id);
  showVoiceBar();
  startVoiceLoop();
  haptic(15);
}
function leaveVoice() {
  if (!voice.on) return;
  voice.on = false;
  live?.send({ t: "vleave", u: myVoiceId() });
  live?.track?.({ voice: false, vmuted: false });
  for (const [, p] of voice.peers) closePeer(p);
  voice.peers.clear();
  voice.mic?.getTracks().forEach((t) => t.stop()); voice.mic = null;
  cancelAnimationFrame(voice.raf); voice.raf = 0;
  try { voice.ctx?.close(); } catch { /* ignore */ }
  voice.ctx = null;
  $("#voiceBar").hidden = true;
  renderVoiceJoin();
}
function toggleVoiceMute() {
  if (!voice.on) return;
  voice.muted = !voice.muted;
  voice.mic?.getAudioTracks().forEach((t) => (t.enabled = !voice.muted));
  live?.track?.({ voice: true, vmuted: voice.muted });
  renderVoiceBar();
  haptic(10);
}

function ensurePeer(id) {
  if (!voice.on || id === myVoiceId() || voice.peers.has(id)) return voice.peers.get(id);
  const polite = myVoiceId() < id;             // smaller id is the polite peer (perfect negotiation)
  const pc = new RTCPeerConnection({ iceServers: ICE });
  const p = { id, pc, polite, makingOffer: false, ignoreOffer: false, stream: null, audioEl: null, src: null, panner: null, dry: null, analyser: null, level: 0 };
  voice.peers.set(id, p);
  for (const track of voice.mic.getTracks()) pc.addTrack(track, voice.mic);
  pc.onicecandidate = ({ candidate }) => { if (candidate) live?.send({ t: "rtc", to: id, u: myVoiceId(), kind: "ice", data: candidate.toJSON ? candidate.toJSON() : { candidate: candidate.candidate, sdpMid: candidate.sdpMid, sdpMLineIndex: candidate.sdpMLineIndex } }); };
  pc.onnegotiationneeded = async () => {
    try { p.makingOffer = true; await pc.setLocalDescription(); const d = pc.localDescription; live?.send({ t: "rtc", to: id, u: myVoiceId(), kind: "desc", data: { type: d.type, sdp: d.sdp } }); }
    catch (e) { console.warn("voice offer", e); } finally { p.makingOffer = false; }
  };
  pc.ontrack = ({ streams }) => { p.stream = streams[0]; wirePeerAudio(p); };
  pc.onconnectionstatechange = () => { if (["failed", "closed", "disconnected"].includes(pc.connectionState)) renderVoiceBar(); else if (pc.connectionState === "connected") renderVoiceBar(); };
  renderVoiceBar();
  return p;
}
function wirePeerAudio(p) {
  if (!voice.ctx || !p.stream) return;
  // Chrome needs the stream attached to an <audio> element too, or Web Audio gets silence
  p.audioEl = new Audio(); p.audioEl.srcObject = p.stream; p.audioEl.muted = true; p.audioEl.play().catch(() => {});
  p.src = voice.ctx.createMediaStreamSource(p.stream);
  p.panner = voice.ctx.createPanner();
  Object.assign(p.panner, { panningModel: "HRTF", distanceModel: "inverse", refDistance: 1, maxDistance: 14, rolloffFactor: 1.1 });
  p.dry = voice.ctx.createGain(); p.dry.gain.value = 1;
  p.src.connect(p.panner);
  p.panner.connect(p.dry); p.dry.connect(voice.master);     // dry (spatial)
  p.panner.connect(voice.convolver);                         // wet send (shared hall)
  p.analyser = voice.ctx.createAnalyser(); p.analyser.fftSize = 256; p.src.connect(p.analyser);
  positionPeer(p);
  renderVoiceBar();
}
function closePeer(p) {
  try { p.pc.close(); } catch { /* ignore */ }
  try { p.src?.disconnect(); p.panner?.disconnect(); p.dry?.disconnect(); p.analyser?.disconnect(); } catch { /* ignore */ }
  if (p.audioEl) { p.audioEl.srcObject = null; p.audioEl = null; }
}

// spatial: a peer's position comes from where they are on the board relative to me
function positionPeer(p) {
  if (!p.panner) return;
  const mine = myViewCenter(), theirs = state.views[p.id];
  if (!theirs) { setPanner(p.panner, 0, 0); return; }
  const k = 1 / 140;                                  // board units -> audio units
  setPanner(p.panner, clamp((theirs.cx - mine.cx) * k, -9, 9), clamp((theirs.cy - mine.cy) * k, -9, 9));
}
function setPanner(panner, x, y) {
  const z = -1.2;   // slightly in front so there's always a little presence
  if (panner.positionX) { panner.positionX.value = x; panner.positionY.value = y; panner.positionZ.value = z; }
  else panner.setPosition(x, y, z);
}
function myViewCenter() {
  const r = vp(), v = state.view;
  return { cx: (r.width / 2 - v.tx) / v.s, cy: (r.height / 2 - v.ty) / v.s };
}

function startVoiceLoop() {
  const tick = () => {
    if (!voice.on) return;
    const now = performance.now();
    if (now - voice.posT > 180) { voice.posT = now; for (const [, p] of voice.peers) positionPeer(p); }
    if (now - voice.speakT > 120) { voice.speakT = now; updateSpeaking(); }
    voice.raf = requestAnimationFrame(tick);
  };
  voice.raf = requestAnimationFrame(tick);
}
const _buf = new Uint8Array(256);
function levelOf(analyser) {
  if (!analyser) return 0;
  analyser.getByteTimeDomainData(_buf);
  let sum = 0; for (let i = 0; i < _buf.length; i++) { const v = (_buf[i] - 128) / 128; sum += v * v; }
  return Math.sqrt(sum / _buf.length);
}
function updateSpeaking() {
  const bar = $("#voiceWho"); if (!bar) return;
  for (const [, p] of voice.peers) {
    p.level = p.level * 0.6 + levelOf(p.analyser) * 0.4;
    const el = bar.querySelector(`[data-vu="${CSS.escape(p.id)}"]`);
    if (el) el.classList.toggle("speaking", p.level > 0.045);
  }
}

function onVoiceMsg(m) {
  if (!m.u || m.u === myVoiceId()) return;
  if (m.t === "vjoin") { renderVoiceJoin(); if (voice.on) ensurePeer(m.u); return; }
  if (m.t === "vleave") { const p = voice.peers.get(m.u); if (p) { closePeer(p); voice.peers.delete(m.u); renderVoiceBar(); } renderVoiceJoin(); return; }
  if (m.t === "rtc") {
    if (m.to !== myVoiceId() || !voice.on) return;
    const p = ensurePeer(m.u); if (!p) return;
    handleRtc(p, m.kind, m.data);
  }
}
async function handleRtc(p, kind, data) {
  const pc = p.pc;
  try {
    if (kind === "desc") {
      const offerCollision = data.type === "offer" && (p.makingOffer || pc.signalingState !== "stable");
      p.ignoreOffer = !p.polite && offerCollision;
      if (p.ignoreOffer) return;
      await pc.setRemoteDescription(data);
      if (data.type === "offer") { await pc.setLocalDescription(); const d = pc.localDescription; live?.send({ t: "rtc", to: p.id, u: myVoiceId(), kind: "desc", data: { type: d.type, sdp: d.sdp } }); }
    } else if (kind === "ice") {
      try { await pc.addIceCandidate(data); } catch (e) { if (!p.ignoreOffer) console.warn("ice", e); }
    }
  } catch (e) { console.warn("voice rtc", e); }
}

// ---- voice UI ----
function voiceSupported() { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.RTCPeerConnection); }
function renderVoiceJoin() {
  const btn = $("#voiceJoinBtn"); if (!btn) return;
  const inVoice = others().filter((m) => state.presence[m.id]?.voice);
  if (!voiceSupported()) { btn.hidden = true; return; }
  btn.hidden = false;
  btn.textContent = voice.on ? "🎙️ In voice — tap to leave" : (inVoice.length ? `🎙️ Join voice (${inVoice.length} in)` : "🎙️ Start voice chat");
  btn.classList.toggle("live", voice.on || inVoice.length > 0);
}
function showVoiceBar() { $("#voiceBar").hidden = false; renderVoiceBar(); }
function renderVoiceBar() {
  const bar = $("#voiceBar"); if (!bar || !voice.on) { if (bar) bar.hidden = !voice.on; return; }
  bar.hidden = false;
  $("#voiceMute").textContent = voice.muted ? "🔇" : "🎙️";
  $("#voiceMute").setAttribute("aria-pressed", String(voice.muted));
  const who = $("#voiceWho"); who.innerHTML = "";
  // me
  who.appendChild(voiceAvatar(state.me, voice.muted, true));
  for (const [id, p] of voice.peers) {
    const m = memberById(id) || { id, name: "Friend", color: "c1" };
    const connected = p.pc && p.pc.connectionState === "connected";
    const chip = voiceAvatar(m, state.presence[id]?.vmuted, false, !connected);
    who.appendChild(chip);
  }
}
function voiceAvatar(m, muted, isMe, connecting) {
  const w = document.createElement("span"); w.className = "vu" + (connecting ? " connecting" : ""); w.dataset.vu = m.id;
  const c = chipEl({ ...m }); c.classList.remove("more"); w.appendChild(c);
  if (muted) { const mm = document.createElement("i"); mm.className = "vmute"; mm.textContent = "🔇"; w.appendChild(mm); }
  const label = document.createElement("small"); label.textContent = isMe ? "You" : (m.name || "").split(" ")[0]; w.appendChild(label);
  return w;
}

function renderMutes() {
  const box = $("#muteList");
  box.querySelectorAll(".mute-row").forEach((r) => r.remove());
  const muted = state.me.muted || [];
  for (const [type, label] of MUTE_TYPES) {
    const row = document.createElement("div"); row.className = "mute-row";
    const s = document.createElement("span"); s.textContent = label; row.appendChild(s);
    const sw = document.createElement("button"); sw.className = "switch"; sw.type = "button"; sw.setAttribute("role", "switch");
    sw.setAttribute("aria-label", label); sw.setAttribute("aria-checked", String(!muted.includes(type)));
    sw.onclick = async () => {
      const prev = state.me.muted || [];
      const next = prev.includes(type) ? prev.filter((x) => x !== type) : [...prev, type];
      state.me.muted = next; sw.setAttribute("aria-checked", String(!next.includes(type)));
      try { await api.updateProfile({ muted: next }); }
      catch { state.me.muted = prev; sw.setAttribute("aria-checked", String(!prev.includes(type))); needsUpgrade(); }
    };
    row.appendChild(sw);
    box.appendChild(row);
  }
}

async function renderAccount() {
  const st = $("#acctStatus"), row = $("#acctLinkRow"), out = $("#logoutBtn"), chg = $("#acctChangeOpen"), crow = $("#acctChangeRow");
  st.textContent = "…"; row.hidden = true; out.hidden = true; chg.hidden = true; crow.hidden = true;
  renderModRow();
  try {
    const a = await api.account();
    if (a.pending) { st.textContent = `Check ${a.pending} and tap the link to finish updating your email.`; row.hidden = false; $("#acctEmail").value = a.pending; $("#acctLinkBtn").textContent = "Resend link"; }
    else if (a.anonymous) { st.textContent = "No email yet. Add one so you can sign back in on a new phone."; row.hidden = false; $("#acctLinkBtn").textContent = "Add email"; }
    else { st.textContent = `Signed in as ${a.email}`; out.hidden = false; chg.hidden = false; }
  } catch { st.textContent = ""; }
}

async function onLinkEmail() {
  const email = $("#acctEmail").value.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast("That email doesn't look right");
  const btn = $("#acctLinkBtn"); busy(btn, true, "Sending…");
  try { await api.linkEmail(email); toast("Check your email and tap the link"); renderAccount(); }
  catch (e) { toast(e.message, 5000); }
  busy(btn, false);
}

async function onChangeEmail() {
  const email = $("#acctNewEmail").value.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast("That email doesn't look right");
  const btn = $("#acctChangeBtn"); busy(btn, true, "Sending…");
  try {
    await api.linkEmail(email);
    $("#acctNewEmail").value = ""; $("#acctChangeRow").hidden = true;
    toast("Check the new email and tap the link to confirm");
    renderAccount();
  } catch (e) { toast(e.message, 5000); }
  busy(btn, false);
}

async function onLogout() {
  if (!confirm("Log out of this phone? You can sign back in with your email anytime.")) return;
  await api.signOut();
  location.reload();
}

function rebuildAllNotes() {
  for (const n of state.notes.values()) { const el = noteEl(n.id); if (el) { buildNoteContent(n, el); placeNote(el, n); } }
}

function renderMemberList() {
  const ul = $("#memberList"); if (!ul) return; ul.innerHTML = "";
  for (const m of state.members) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="chip" style="background:${BRIGHT[m.color] || BRIGHT.c1}"></span><span></span>`;
    li.querySelector(".chip").textContent = (m.name || "?").slice(0, 1).toUpperCase();
    li.querySelector("span:last-child").textContent = m.name + (m.id === state.me?.id ? " (you)" : "");
    if (m.id !== state.me?.id && state.board?.created_by === state.me?.id) {
      const b = document.createElement("button"); b.className = "btn small danger"; b.textContent = "Remove";
      b.onclick = async () => {
        if (!confirm(`Remove ${m.name} from this board? They'd need the code to rejoin.`)) return;
        try { await api.removeMember(state.board.id, m.id); await refreshMembers(); } catch (e) { toast(e.message); }
      };
      li.appendChild(b);
    }
    ul.appendChild(li);
  }
}

async function shareCode() {
  const code = fmtCode(state.board?.code);
  const url = inviteUrl(state.board?.code);
  const text = `Join my board on Pinned 💌 Tap the link, or use code ${code}`;
  try {
    if (navigator.share) await navigator.share({ title: "Pinned", text, url });
    else { await navigator.clipboard.writeText(`${text}\n${url}`); toast("Invite link copied"); }
  } catch { /* user cancelled */ }
}
function toggleWaitQr() {
  const wrap = $("#waitQrWrap");
  if (!wrap || $("#waitQR")?.dataset.ok !== "1") { // QR unavailable (offline / blocked) → copy the link instead
    const url = inviteUrl(state.board?.code);
    navigator.clipboard?.writeText(url).then(() => toast("Invite link copied")).catch(() => toast(url, 6000));
    return;
  }
  wrap.hidden = !wrap.hidden;
}

// ---------------------------------------------------------------- notifications
function notifSupport() {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    if (isIOS && !isStandalone()) return "install";
    return "unsupported";
  }
  if (!isDemo && !("PushManager" in window)) return isIOS && !isStandalone() ? "install" : "unsupported";
  if (isIOS && !isStandalone()) return "install";
  return "ok";
}

function renderNotifStatus() {
  const st = $("#notifStatus"), btn = $("#notifBtn"), hint = $("#notifHint");
  hint.hidden = true; btn.hidden = false; $("#notifReset").hidden = true;
  const sup = notifSupport();
  if (sup === "install") {
    st.textContent = "Add to Home Screen first";
    hint.textContent = "On iPhone: tap the Share button in Safari, choose \"Add to Home Screen\", then open Pinned from your home screen and turn notifications on here.";
    hint.hidden = false; btn.hidden = true; return;
  }
  if (sup === "unsupported") { st.textContent = "Not supported in this browser"; btn.hidden = true; return; }
  if (!api.pushReady()) { st.textContent = "Not set up yet (see SETUP.md)"; btn.hidden = true; return; }
  const p = Notification.permission;
  if (p === "granted") {
    st.textContent = "On"; btn.textContent = "Send test"; $("#notifReset").hidden = false;
    // health check: is this device actually registered to receive push?
    if (!isDemo) navigator.serviceWorker?.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => { if (Notification.permission !== "granted") return; st.textContent = sub ? "On · this phone is registered ✓" : "On, but this phone isn't registered — tap Reset"; })
      .catch(() => {});
  }
  else if (p === "denied") {
    st.textContent = "Blocked";
    hint.textContent = isIOS ? "Turn them back on in iPhone Settings > Notifications > Pinned." : "Turn them back on in your phone's settings for this app (long-press the icon > App info > Notifications).";
    hint.hidden = false; btn.hidden = true;
  } else { st.textContent = "Off"; btn.textContent = "Turn on"; }
}

async function onNotifBtn() {
  if (Notification.permission === "granted") {
    if (isDemo) return localNotify("Notifications are working 🎉");
    const btn = $("#notifBtn"); busy(btn, true, "Sending…");
    await refreshPushSubscription(true);
    const r = await api.notify(state.board.id, "note", { test: true });
    busy(btn, false);
    if (!r) toast("No answer from the server");
    else if (r.error) toast("Server error: " + r.error, 6000);
    else if (!r.devices) toast("This phone isn't registered yet. Turn notifications off and on in your phone settings, then try again.", 6000);
    else if (r.sent) toast(`Test sent to ${r.devices} device${r.devices > 1 ? "s" : ""}. It should pop up in a few seconds.${(r.failures || []).length ? " (" + r.failures.length + " failed)" : ""}`, 5000);
    else {
      const f = (r.failures || []).join("; ");
      toast(/BadJwtToken|403/.test(f) ? "Apple refused the notification (403). Redeploy the notify function from the latest files, then tap Reset." : "Push service refused it: " + f, 9000);
    }
    return;
  }
  const perm = await Notification.requestPermission();
  if (perm === "granted") { await refreshPushSubscription(true); toast("Notifications on. Tap Send test to check."); }
  renderNotifStatus();
}

// Throw away this phone's notification registration and make a fresh one (fixes stale iPhone registrations)
async function resetPush() {
  if (notifSupport() !== "ok" || Notification.permission !== "granted") return toast("Turn notifications on first");
  const btn = $("#notifReset"); busy(btn, true, "Resetting…");
  try {
    const reg = await navigator.serviceWorker.ready;
    const old = await reg.pushManager.getSubscription();
    if (old) { await old.unsubscribe().catch(() => {}); }
    await refreshPushSubscription(true);
    const r = await api.notify(state.board.id, "note", { test: true });
    if (r?.sent) toast("Reset done. A test notification is on its way ✅", 5000);
    else toast("Reset done, but the test didn't send: " + (r?.error || (r?.failures || []).join("; ") || "no device registered"), 9000);
  } catch (e) { toast("Couldn't reset: " + e.message, 6000); }
  busy(btn, false);
}

async function refreshPushSubscription(force = false) {
  try {
    if (isDemo || notifSupport() !== "ok" || !api.pushReady()) return;
    if (Notification.permission !== "granted") return;
    const reg = await navigator.serviceWorker.ready;
    const key = b64uToBytes(CONFIG.vapidPublicKey);
    let sub = await reg.pushManager.getSubscription();
    // if the keys were regenerated, the old subscription is useless: replace it
    const old = sub && sub.options && sub.options.applicationServerKey ? new Uint8Array(sub.options.applicationServerKey) : null;
    if (sub && old && (old.length !== key.length || old.some((b, i) => b !== key[i]))) { await sub.unsubscribe(); sub = null; }
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
    await api.savePushSub(sub.toJSON());
  } catch (e) { console.warn("push subscribe failed", e); if (force) toast("Couldn't turn on notifications: " + e.message); }
}

async function localNotify(body) {
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification("Pinned", { body, icon: "icons/icon-192.png", tag: "soy-note" });
  } catch { toast(body); }
}

function clearBadge() { if (navigator.clearAppBadge) navigator.clearAppBadge().catch(() => {}); }

function b64uToBytes(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "=";
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

// ---------------------------------------------------------------- wiring
function wireStatic() {
  $("#sendLink").onclick = () => onSendLink(false);
  $("#emailInput").addEventListener("keydown", (e) => e.key === "Enter" && onSendLink(false));
  $("#resendLink").onclick = () => onSendLink(true);
  $("#changeEmail").onclick = () => { clearInterval(pollTimer); ls.set(PENDING, null); setError($("#loginError")); $("#loginForm").hidden = false; $("#loginWait").hidden = true; };
  $("#acctLinkBtn").onclick = onLinkEmail;
  $("#logoutBtn").onclick = onLogout;
  $("#welcomeGo").onclick = onWelcome;
  $("#nameInput").addEventListener("keydown", (e) => e.key === "Enter" && onWelcome());
  $("#createBoard").onclick = onCreateBoard;
  $("#joinBoard").onclick = onJoinBoard;
  $("#codeInput").addEventListener("input", (e) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    e.target.value = raw.length > 4 ? raw.slice(0, 4) + "-" + raw.slice(4) : raw;
  });

  // composer
  $("#fab").onclick = openComposer;
  $("#composerCancel").onclick = () => { resetRec(); closeSheet("composer"); };
  $("#composerBackdrop").onclick = () => { resetRec(); closeSheet("composer"); };
  $("#composerSend").onclick = sendCompose;
  document.querySelectorAll("#composerTabs button").forEach((b) => (b.onclick = () => setTab(b.dataset.tab)));
  swatchRow($("#textSwatches"), compose.color, (c) => { compose.color = c; ls.set("pinned-note-color", c); paintPaper($("#textPreview"), c); });
  paintPaper($("#textPreview"), compose.color);
  swatchRow($("#padSwatches"), compose.padColor, (c) => { compose.padColor = c; ls.set("pinned-pen-color", c); paintPaper($("#padWrap"), c); });
  paintPaper($("#padWrap"), compose.padColor);
  swatchRow($("#cdSwatches"), compose.cdColor, (c) => { compose.cdColor = c; updateCdPreview(); });
  ["#cdTitle", "#cdDate", "#cdTime"].forEach((s) => $(s).addEventListener("input", updateCdPreview));
  $("#schedToggle").onclick = () => setSched(!compose.sched);
  document.querySelectorAll("#schedRow .quick button").forEach((b) => (b.onclick = () => setQuick(b.dataset.q)));
  $("#recBtn").onclick = toggleRec;
  $("#recPlay").onclick = playRec;
  $("#recRedo").onclick = () => resetRec();

  const grid = $("#emojiGrid");
  for (const em of EMOJIS) {
    const b = document.createElement("button"); b.type = "button"; b.textContent = em; b.setAttribute("aria-pressed", String(em === compose.emoji));
    b.onclick = () => { compose.emoji = em; $("#emojiCustom").value = ""; $("#emojiHero").textContent = em; grid.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); };
    grid.appendChild(b);
  }
  $("#emojiCustom").addEventListener("input", (e) => { $("#emojiHero").textContent = e.target.value.trim() || compose.emoji; });

  $("#photoInput").addEventListener("change", async (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    try {
      compose.photo = await compressImage(f);
      const p = $("#photoPreview"); p.src = URL.createObjectURL(compose.photo); p.hidden = false; $("#photoHint").hidden = true;
    } catch (err) { toast(err.message); }
  });

  // detail
  $("#detailClose").onclick = () => closeSheet("detail");
  $("#detailBackdrop").onclick = () => closeSheet("detail");
  $("#detailRemove").onclick = removeDetail;
  $("#detailFront").onclick = frontDetail;
  $("#detailPin").onclick = pinDetail;
  $("#detailEdit").onclick = () => { const id = detailId; closeSheet("detail"); if (id) openEdit(id); };
  $("#replySend").onclick = sendReply;
  $("#replyInput").addEventListener("keydown", (e) => e.key === "Enter" && sendReply());

  // dock + extra sheets
  buildPingGrid($("#pingFeelings"), FEELINGS);
  buildPingGrid($("#pingMoods"), MOODS);
  $("#dockPing").onclick = openPing;
  $("#pingClose").onclick = () => closeSheet("ping");
  $("#pingBackdrop").onclick = () => closeSheet("ping");
  $("#dockQuestion").onclick = openQuestion;
  $("#qSend").onclick = sendAnswer;
  $("#qClose").onclick = () => closeSheet("question");
  $("#questionBackdrop").onclick = () => closeSheet("question");
  $("#dockDoodle").onclick = openTogether;
  $("#tClose").onclick = () => closeSheet("together");
  $("#togetherBackdrop").onclick = () => closeSheet("together");
  $("#tStick").onclick = stickTogether;
  $("#tInvite").onclick = async () => {
    const r = await api.notify(state.board.id, "doodle");
    toast(r?.error ? "Couldn't send the invite" : `Invite sent to ${others().length === 1 ? others()[0].name : "everyone"} 💌`);
  };

  // settings
  $("#switchBoardBtn").onclick = () => { $("#switchRow").hidden = !$("#switchRow").hidden; if (!$("#switchRow").hidden) $("#switchCode").focus(); };
  $("#switchGo").onclick = switchBoard;
  $("#switchCode").addEventListener("input", (e) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    e.target.value = raw.length > 4 ? raw.slice(0, 4) + "-" + raw.slice(4) : raw;
  });
  $("#leaveBoardBtn").onclick = leaveBoard;
  $("#exportBoardBtn").onclick = exportBoard;
  $("#deleteBoardBtn").onclick = deleteBoard;
  $("#openSettings").onclick = openSettings;
  $("#settingsClose").onclick = () => closeSheet("settings");
  $("#settingsBackdrop").onclick = () => closeSheet("settings");
  $("#shareCode").onclick = shareCode;
  $("#waitShare").onclick = shareCode;
  $("#waitQrBtn").onclick = toggleWaitQr;
  $("#notifBtn").onclick = onNotifBtn;
  $("#notifReset").onclick = resetPush;
  $("#vibeSwitch").onclick = () => { hapticsOn = hapticsOn === false; ls.set("pinned-haptics", hapticsOn); $("#vibeSwitch").setAttribute("aria-checked", String(hapticsOn)); if (hapticsOn) haptic(20); };
  $("#saveName").onclick = async () => {
    const name = $("#settingsName").value.trim(); if (!name) return;
    try { await api.updateProfile({ name }); state.me.name = name; await refreshMembers(); toast("Saved"); } catch (e) { toast(e.message); }
  };
  $("#roomHead").onclick = openRoomSheet;
  $("#roomSheetClose").onclick = () => closeSheet("roomSheet");
  fxInit();
  $("#rsAdmin").onclick = () => roomChange(async () => { await api.takeRoomAdmin(state.board.id); state.board.created_by = state.me.id; renderRoomSheet(); }, "You're the admin now");
  $("#rsListed").onclick = () => {
    const want = state.board.listed === false;
    roomChange(async () => { await api.setRoomListed(state.board.id, want); state.board.listed = want; renderRoomSheet(); }, want ? "Shown on the room map" : "Hidden from the room map. People inside still see it.");
  };
  $("#roomSheetBackdrop").onclick = () => closeSheet("roomSheet");
  $("#peekJoin").onclick = joinPeek; $("#peekDelete").onclick = deletePeek; $("#peekClose").onclick = () => closeSheet("roomPeek"); $("#roomPeekBackdrop").onclick = () => closeSheet("roomPeek");
  $("#rsSaveName").onclick = () => {
    const name = $("#rsName").value.trim().slice(0, ROOM_NAME_MAX);
    if (!name) return toast("Type a room name first");
    roomChange(async () => {
      await api.renameRoom(state.board.id, name);
      state.board.name = name; renderRoomHead(); renderRoomSheet(); haptic(12);
    }, "Room renamed");
  };
  $("#rsPhotoBtn").onclick = () => $("#roomPhotoInput").click();
  $("#rsPhoto").onclick = () => $("#roomPhotoInput").click();
  $("#roomPhotoInput").addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return;
    roomChange(async () => {
      const boardId = state.board.id, old = state.board.photo_path;
      const blob = await compressImage(f, 512, 0.85);
      const path = await api.uploadRoomPhoto(boardId, blob);
      await api.setRoomPhoto(boardId, path);
      const urls = await api.mediaUrls([path]); Object.assign(state.urls, urls);
      state.board.photo_path = path;
      if (old && old !== path) api.removeRoomFile(old);
      renderRoomHead(); renderRoomSheet(); haptic(12);
    }, "Room photo updated");
  });
  $("#rsRemovePhoto").onclick = () => roomChange(async () => {
    const old = state.board.photo_path;
    await api.setRoomPhoto(state.board.id, null);
    state.board.photo_path = null;
    if (old) api.removeRoomFile(old);
    renderRoomHead(); renderRoomSheet();
  }, "Room photo removed");
  $("#rsLock").onclick = () => {
    const want = !state.board.locked;
    roomChange(async () => {
      await api.setRoomLock(state.board.id, want);
      state.board.locked = want; renderRoomHead(); renderRoomSheet(); haptic(12);
      if (want) fxAnnounce("sparkle");
    }, want ? "Room locked. Nobody new can join with the code." : "Room unlocked");
  };
  $("#avatarEdit").onclick = () => $("#avatarInput").click();
  $("#avatarInput").addEventListener("change", async (e) => {
    const f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return;
    try {
      const blob = await compressImage(f, 256, 0.85);
      const path = await api.uploadAvatar(blob);
      await api.updateProfile({ avatar_path: path });
      const urls = await api.mediaUrls([path]); Object.assign(state.urls, urls);
      state.me.avatar_path = path;
      const ap = $("#avatarPreview"); ap.style.backgroundImage = `url("${state.urls[path]}")`; ap.textContent = "";
      await refreshMembers(); haptic(12); toast("Picture updated");
    } catch (err) { toast(err.message || "Couldn't update your picture"); }
  });
  $("#settingsBio").addEventListener("input", (e) => { $("#bioCount").textContent = `${e.target.value.length}/300`; });
  $("#saveBio").onclick = async () => {
    const bio = $("#settingsBio").value.trim() || null;
    try { await api.updateProfile({ bio }); state.me.bio = bio; await refreshMembers(); toast("Bio saved"); }
    catch (e) { /relation|column|schema cache/i.test(e.message || "") ? toast("Bios need upgrade-v10.sql in Supabase", 4000) : toast(e.message); }
  };

  window.addEventListener("resize", () => { if (state.board) layoutBoard(); });
  wireCanvas();
  $("#toolHome").onclick = () => goHome();
  $("#funToggle").onclick = () => {
    const open = $(".fun-tray").classList.toggle("open");
    $("#funToggle").setAttribute("aria-expanded", String(open));
  };
  $("#toolChurch").onclick = () => { if (state.me && state.board) openChurch({ me: state.me, api, boardEl: $("#boardScreen"), boardId: state.board.id }); };
  $("#toolFind").onclick = () => (others().filter((m) => state.views[m.id]).length > 1 ? openPeople() : findSomeone());
  $("#toolDraw").onclick = () => setInkMode(!inkMode);
  $("#bDone").onclick = () => setInkMode(false);
  $("#openRooms").onclick = openRoomsFromBoard;
  $("#menuEdit").onclick = () => { roomsState.edit = !roomsState.edit; renderRooms(); };
  $("#menuNew").onclick = () => showPair();
  $("#pairBack").onclick = () => showMenu();
  $("#menuMusic").onclick = () => {
    menuMusicOn = !menuMusicOn; ls.set("pinned.menu.music", menuMusicOn);
    $("#menuMusic").setAttribute("aria-pressed", String(menuMusicOn)); $("#menuMusic").textContent = menuMusicOn ? "🎵" : "🔇";
    if (menuMusicOn) menuMusicStart(); else stopMenuMusic();
  };
  $("#menuMusic").setAttribute("aria-pressed", String(menuMusicOn)); $("#menuMusic").textContent = menuMusicOn ? "🎵" : "🔇";
  $("#menu").addEventListener("pointerdown", () => { if (menuMusicOn) menuMusicStart(); }, { passive: true });
  buildTools({ pens: $("#bPens"), sizes: $("#bSizes"), eraser: $("#bEraser"), undo: $("#bUndo"), clear: $("#bClear") }, inkTool, { onUndo: inkUndo, onClear: () => {}, slider: true });
  $("#bBrushPen").onclick = () => { inkTool.brush = "pen"; setBoardTool("draw"); };
  $("#bBrushMarker").onclick = () => { inkTool.brush = "marker"; setBoardTool("draw"); };
  $("#bBrushHi").onclick = () => { inkTool.brush = "hi"; setBoardTool("draw"); };
  $("#bEyedrop").onclick = () => setBoardTool(inkTool.tool === "eyedrop" ? "draw" : "eyedrop");
  $("#bFill").onclick = () => setBoardTool(inkTool.tool === "fill" ? "draw" : "fill");
  $("#bText").onclick = () => setBoardTool(inkTool.tool === "text" ? "draw" : "text");
  $("#bShape").onclick = () => { const m = $("#shapeMenu"); m.hidden = !m.hidden; };
  $("#shapeMenu").addEventListener("click", (e) => {
    const b = e.target.closest("[data-shape]"); if (!b) return;
    inkTool.shape = b.dataset.shape; inkTool.erasing = false; inkTool.tool = "shape";
    $("#shapeMenu").hidden = true; syncBoardUI();
  });
  $("#bZoomIn").onclick = () => zoomCenter(1.25);
  $("#bZoomOut").onclick = () => zoomCenter(0.8);
  $("#bEraser").onclick = () => { if (inkTool.erasing) setBoardTool("draw"); else { inkTool.erasing = true; inkTool.tool = "draw"; syncBoardUI(); } };
  $("#bPens").addEventListener("click", () => setTimeout(syncBoardUI, 0));
  $("#bSizes").addEventListener("click", () => setTimeout(syncBoardUI, 0));
  syncBoardUI();
  $("#memberChips").onclick = openPeople;
  $("#dockChats").onclick = openChats;
  $("#fbBack").onclick = fbBack;
  $("#modBack").onclick = closeModeration;
  $("#modOpen").onclick = openModeration;
  $("#fbExport").onclick = fbExportCsv;
  $("#fbNewBtn").onclick = () => { fb.view = "new"; renderFeedback(); $("#fbNewTitle").focus(); };
  $("#fbNewCancel").onclick = () => { fb.view = "list"; renderFeedback(); };
  $("#fbNewPost").onclick = fbPostNew;
  $("#fbReplySend").onclick = fbSend;
  $("#fbReplyInput").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); fbSend(); } });
  $("#fbReplyX").onclick = () => { fb.replyTo = null; fbUpdateReplyBar(); };
  $("#fbFrom").onchange = () => {}; $("#fbTo").onchange = () => {};
  $("#replyBarX").onclick = () => { chat.replyTo = null; updateReplyBar(); };
  $("#acctChangeOpen").onclick = () => { $("#acctChangeRow").hidden = false; $("#acctChangeOpen").hidden = true; $("#acctNewEmail").focus(); };
  $("#acctChangeBtn").onclick = onChangeEmail;
  // feedback is shared, so refresh it on a timer while the app is open
  setInterval(() => { if (state.me && !document.hidden) loadFeedback(true); }, 15000);
  // Phase 3: five-item dock. Check in and Today live behind More (their hidden originals keep their handlers).
  $("#dockNotes").onclick = () => { document.querySelectorAll(".sheet").forEach((el) => { if (!el.hidden && $("#" + el.id + "Backdrop")) closeSheet(el.id); }); };
  $("#dockMore").onclick = () => openSheet("more");
  $("#dockGames").onclick = openGames;
  $("#gsBack").onclick = backFromGames;
  $("#gsTabGames").onclick = showGamesList;
  $("#gsTabScores").onclick = showScoresList;
  $("#moreBackdrop").onclick = () => closeSheet("more");
  $("#moreClose").onclick = () => closeSheet("more");
  $("#noteMenuBackdrop").onclick = () => closeSheet("noteMenu");
  $("#nmClose").onclick = () => closeSheet("noteMenu");
  // Phase 4: theme builder
  buildTbControls();
  $("#themeBuilderBackdrop").onclick = () => closeSheet("themeBuilder");
  $("#tbCancel").onclick = () => closeSheet("themeBuilder");
  $("#tbSave").onclick = saveThemeFromBuilder;
  $("#tbDelete").onclick = deleteThemeFromBuilder;
  $("#tbDuplicate").onclick = duplicateThemeFromBuilder;
  $("#tbExport").onclick = () => exportThemes([{ name: (tb.name || "").trim() || "My theme", base: tb.base, tokens: tb.tokens }]);
  $("#themeExport").onclick = () => exportThemes(customThemes());
  $("#themeImport").onchange = (e) => { importThemesFile(e.target.files?.[0]).catch(() => toast("Couldn't import that file")); e.target.value = ""; };
  $("#calmSwitch").onclick = () => { const on = ls.get("pinned-calm", false) !== true; ls.set("pinned-calm", on); document.documentElement.classList.toggle("calm", on); renderFeelSwitches(); };
  $("#decoSwitch").onclick = () => { const on = ls.get("pinned-deco", true) === false; ls.set("pinned-deco", on); document.documentElement.classList.toggle("no-deco", !on); renderFeelSwitches(); };
  document.querySelectorAll("#more [data-proxy]").forEach((b) => b.onclick = () => { closeSheet("more"); $("#" + b.dataset.proxy).click(); });
  setInterval(() => { const d = $("#moreDot"); if (d) d.hidden = $("#qDot").hidden; }, 1500);
  $("#chatsClose").onclick = () => closeSheet("chats");
  $("#chatsBackdrop").onclick = () => closeSheet("chats");
  $("#chatBack").onclick = () => { chat.peer = null; $("#chatList").hidden = false; $("#chatThread").hidden = true; renderThreadList(); };
  $("#msgSend").onclick = () => sendChat();
  $("#msgInput").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } });
  $("#msgInput").addEventListener("input", sendTyping);
  // Paste an image (screenshot or copied picture) straight into the chat, the same as the photo button.
  // Plain text pastes are left alone.
  $("#msgInput").addEventListener("paste", async (e) => {
    const items = [...(e.clipboardData?.items || [])];
    const img = items.find((it) => it.kind === "file" && it.type.startsWith("image/"));
    if (!img) return;
    e.preventDefault();
    const file = img.getAsFile();
    if (!file) return;
    try { sendChat(await compressImage(file)); }
    catch (err) { toast(err.message || "Couldn't use that image"); }
  });
  $("#msgPhoto").addEventListener("change", async (e) => {
    const f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return;
    try { sendChat(await compressImage(f)); } catch (err) { toast(err.message); }
  });
  $("#bgMode").querySelectorAll("button").forEach((b) => (b.onclick = () => setBgMode(b.dataset.mode)));
  $("#bgFile").addEventListener("change", (e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; onBgFile(f); });
  $("#bgClear").onclick = () => setBackground(null);
  $("#linkInput").addEventListener("input", onLinkInput);
  $("#linkInput").addEventListener("paste", () => setTimeout(onLinkInput, 0));
  $("#sOpen").onclick = () => { const id = sel?.id; deselect(); if (id) openDetail(id); };
  $("#sEdit").onclick = () => { const id = sel?.id; if (id) openEdit(id); };
  $("#sRotL").onclick = () => selRotate(-15);
  $("#sRotR").onclick = () => selRotate(15);
  $("#sFlipX").onclick = () => selFlip("x");
  $("#sFlipY").onclick = () => selFlip("y");
  $("#sReset").onclick = selReset;
  $("#sDelete").onclick = selDeleteStroke;
  $("#sDone").onclick = deselect;
  $("#eSave").onclick = saveEdit;
  $("#eCancel").onclick = () => closeSheet("edit");
  $("#editBackdrop").onclick = () => closeSheet("edit");
  $("#ePhoto").addEventListener("change", async (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    try { editPhoto = await compressImage(f); $("#ePhotoName").textContent = "New photo ready ✓"; } catch (err) { toast(err.message); }
  });
  $("#peopleClose").onclick = closePeople;
  $("#peopleBackdrop").onclick = closePeople;
  $("#peopleInvite").onclick = shareCode;
  // voice chat
  $("#voiceJoinBtn").onclick = () => (voice.on ? leaveVoice() : joinVoice());
  $("#voiceMute").onclick = toggleVoiceMute;
  $("#voiceLeave").onclick = leaveVoice;
  // live location
  $("#toolLoc").onclick = openLoc;
  $("#locClose").onclick = closeLoc;
  $("#locMapBtn").onclick = openMap;
  $("#mapClose").onclick = () => closeSheet("map");
  $("#mapBackdrop").onclick = () => closeSheet("map");
  $("#locBackdrop").onclick = closeLoc;
  $("#locSwitch").onclick = toggleGeo;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && pollTimer) { const p = ls.get(PENDING); if (p) startPolling(p.nonce); }
    if (document.visibilityState === "visible") onResume(true);
    if (document.visibilityState === "hidden") { hiddenAt = Date.now(); markSeen(); live?.track({ visible: false }); sendCursor(null); if (state.board) api.touchSeen(state.board.id); }
    else live?.track({ visible: true });
  });
  // iPhone home-screen apps don't always fire visibilitychange when reopened; these catch the rest
  window.addEventListener("pageshow", () => onResume());
  window.addEventListener("focus", () => onResume());
  window.addEventListener("online", () => { hiddenAt = hiddenAt || 1; realtimeDown = false; updateConn(); onResume(true); flushOutbox(); });
  window.addEventListener("offline", () => updateConn());
  window.addEventListener("pagehide", () => { hiddenAt = Date.now(); markSeen(); });
  // undo / redo
  $("#histUndo").onclick = doUndo;
  $("#histRedo").onclick = doRedo;
  window.addEventListener("keydown", (e) => {
    if (!state.board || $("#boardScreen").hidden) return;
    if (e.target.matches && e.target.matches("input, textarea, [contenteditable]")) return;
    const z = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z";
    if (z && e.shiftKey) { e.preventDefault(); doRedo(); }
    else if (z) { e.preventDefault(); doUndo(); }
  });
}

boot();
