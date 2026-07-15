/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRIAL_PORTAL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
