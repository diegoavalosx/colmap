# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
# colmap

## Google Drive campaign imports

Campaign managers can select up to five photos from Google Drive. The app reads
GPS metadata supplied by Drive, asks the manager to place photos without GPS on
a map, groups photos taken within 25 meters, copies them to Firebase Storage,
and creates the corresponding Firestore map locations.

To enable the Drive picker, copy `.env.example` to `.env.local` and configure:

- `VITE_GOOGLE_DRIVE_CLIENT_ID`: a Google OAuth web client ID.
- `VITE_GOOGLE_DRIVE_API_KEY`: a browser API key with the Google Picker and
  Drive APIs enabled. Restrict it to the site's authorized origins and APIs.
- `VITE_GOOGLE_DRIVE_APP_ID`: the Google Cloud project number.

The OAuth client must include the local and deployed site origins under its
authorized JavaScript origins. Drive access uses the narrow `drive.file` scope,
and access tokens are kept in memory rather than stored in Firestore or browser
storage.
