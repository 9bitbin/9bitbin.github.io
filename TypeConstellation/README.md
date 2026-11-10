# Constellation — setup (GitHub Pages + Supabase)

Files:
- `index.html`: the quiz. Takers enter a name, take the quiz, and their result is saved.
- `admin.html`: your private results table (needs your login).
- `supabase-setup.sql`: creates the results table and the security rules.
- `supabase-update-feedback.sql`: adds the feedback table (v1.1). Run it after the setup file.

## 1. Supabase (about 5 minutes)
1. Create a project at supabase.com.
2. **SQL Editor → New query**: paste `supabase-setup.sql`, change `YOUR_EMAIL@example.com` (2 places) to your email, and click **Run**.
3. **Authentication → Users → Add user → Create new user**: enter the same email and a strong password, and tick "Auto confirm user". This is your owner login.
4. **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up" so nobody else can make an account. Only your email can read results anyway, but this is extra safety.
5. **Project Settings → API**: copy the **Project URL** and the **anon public** key.
   - Never use the `service_role` key on a web page. It bypasses all security.

### Already ran the setup? Adding v1.1 (growth guide + feedback)
Run `supabase-update-feedback.sql` the same way, after changing `YOUR_EMAIL@example.com` (2 places). Then replace `index.html` and `admin.html` on GitHub, and paste your keys back in.

## 2. Paste your keys
In **both** `index.html` and `admin.html`, find these lines and paste your values:
```js
const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY';
```
The anon key is meant to be public. The SQL rules make it insert-only for strangers.

## 3. GitHub Pages
1. Put the files in a repo (for example `9bitbin/constellation`).
2. **Settings → Pages → Deploy from branch → main / root**.
3. Quiz: `https://9bitbin.github.io/constellation/`
4. Your results: `https://9bitbin.github.io/constellation/admin.html`

## What gets saved per take
Name, a random browser ID (so repeat takes from one browser link together), type, subtype (dom–other, aux or tert), lead, animal, confidence, all 8 coin scores, the 16-type likelihoods, and every answer (question text + chosen option). Takers see a note before starting that the owner can see their name and answers.

## Feedback (v1.1)
After their result, takers can rate the fit (1–5), tick what felt off, pick the type they think they are, and leave a short note. In `admin.html`:
- The header shows the number of takes, the average fit, and how many people think they're a different type.
- The **Fit** column is color-coded: red is 1–2, yellow is 3, green is 4–5.
- Click a row to see the full feedback.

Once you have 20–30 takes, look for patterns: one type rated low, or one "felt off" box ticked a lot. That tells you which questions to fix.

## Notes
- If saving fails, the result page shows "Couldn't save. Try again". Hover it to see the error.
- Anyone who finds the URL could submit junk rows. The table limits sizes and formats, and you can delete rows in Supabase's Table Editor.
