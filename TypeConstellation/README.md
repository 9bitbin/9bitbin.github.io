# Constellation — setup (GitHub Pages + Supabase)

Files:
- `index.html`: the quiz. Takers enter a name, take the quiz, and their result is saved.
- `admin.html`: your private results table (needs your login).
- `supabase-setup.sql`: creates the table and the security rules.

## 1. Supabase (about 5 minutes)
1. Create a project at supabase.com.
2. **SQL Editor → New query**: paste `supabase-setup.sql`, change `YOUR_EMAIL@example.com` (2 places) to your email, and click **Run**.
3. **Authentication → Users → Add user → Create new user**: enter the same email and a strong password, and tick "Auto confirm user". This is your owner login.
4. **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up" so nobody else can make an account. Only your email can read results anyway, but this is extra safety.
5. **Project Settings → API**: copy the **Project URL** and the **anon public** key.
   - Never use the `service_role` key on a web page. It bypasses all security.

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

## Notes
- If saving fails, the result page shows "Couldn't save. Try again". Hover it to see the error.
- Anyone who finds the URL could submit junk rows. The table limits sizes and formats, and you can delete rows in Supabase's Table Editor.
