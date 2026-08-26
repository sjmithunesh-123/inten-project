## Google OAuth

The Google button uses Supabase Auth and requires the provider to be enabled in the Supabase dashboard:

1. Open Authentication > Providers > Google and enable it.
2. Add the Google OAuth Client ID and Client Secret from Google Cloud.
3. In Authentication > URL Configuration, add the development redirect URLs used by Vite:
  - `http://localhost:5173`
  - `http://localhost:5174`
  - `http://localhost:5175`
  - `http://127.0.0.1:5173`
  - `http://127.0.0.1:5174`
  - `http://127.0.0.1:5175`

Google Cloud and Supabase use different redirect URL lists. In Google Cloud
Console > APIs & Services > Credentials > your Web OAuth client, add this exact
Authorized redirect URI:

`https://coagareymxoambnxtukr.supabase.co/auth/v1/callback`

Do not add the localhost URL to Google Cloud as the OAuth callback. The localhost
URL belongs in Supabase Authentication > URL Configuration as the post-login
application redirect. The current local value is `http://127.0.0.1:5175`.

The frontend sends `VITE_AUTH_REDIRECT_URL` as the post-login application URL.
For local development it is set to `http://127.0.0.1:5175` in `.env.local`; keep
that exact URL in Supabase URL Configuration. The Google Cloud OAuth redirect URI
is different and must be the Supabase callback:

`https://coagareymxoambnxtukr.supabase.co/auth/v1/callback`

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
