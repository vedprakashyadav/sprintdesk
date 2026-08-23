/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DUMMYJSON_BASE_URL: string;
  readonly VITE_JSONPLACEHOLDER_BASE_URL: string;
  readonly VITE_NOTIFICATIONS_POLL_INTERVAL_MS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
