# Spanish O Level Revision

Static Spanish revision web app with a Supabase Auth gate.

## Supabase setup

1. Create a Supabase project.
2. In Supabase, open Authentication and keep email/password signups enabled.
3. Copy the project URL and anon public key from Project Settings > API.
4. Paste them into `config.js`:

```js
window.SPANISH_SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT_ID.supabase.co",
  anonKey: "YOUR_SUPABASE_ANON_KEY"
};
```

5. In Authentication > URL Configuration, set the site URL to your deployed app URL.
   For GitHub Pages this is usually `https://lormaigai.github.io/espanol/`.

The app stays locked until Supabase is configured and the user signs up or signs in.

## GitHub Pages

Deploy from the `main` branch and root folder.
