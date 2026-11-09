// Deletes the account of the person who calls it.
// Deploy once (owner): supabase functions deploy delete-account
// The caller is identified from their own sign-in token, never from the request body.
// Check before deploying: if other tables reference auth.users without ON DELETE CASCADE,
// the deleteUser call will fail and the error is returned to the app.
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  const auth = req.headers.get("Authorization") ?? "";
  if (req.method !== "POST" || !auth.startsWith("Bearer ")) return json({ error: "Not signed in" }, 401);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const userClient = createClient(url, anonKey, { global: { headers: { Authorization: auth } } });
  const { data: { user }, error: userErr } = await userClient.auth.getUser();
  if (userErr || !user) return json({ error: "Not signed in" }, 401);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error: profErr } = await admin.from("profiles").delete().eq("id", user.id);
  if (profErr) return json({ error: "Could not remove the profile" }, 500);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return json({ error: "Could not delete the sign-in" }, 500);
  return json({ ok: true });
});
