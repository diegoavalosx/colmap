/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_GOOGLE_DRIVE_CLIENT_ID?: string;
  readonly VITE_GOOGLE_DRIVE_API_KEY?: string;
  readonly VITE_GOOGLE_DRIVE_APP_ID?: string;
  readonly NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
