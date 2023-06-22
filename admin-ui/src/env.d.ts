/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_CHAT_SERVICE_URL: string
    readonly VITE_DOCS_SERVICE_URL: string
    readonly VITE_KEYCLOAK_URI: string
    readonly VITE_KEYCLOAK_CLIENT: string
    readonly VITE_KEYCLOAK_REALM: string
    readonly VITE_APPLICATION_NAME: string
    // more env variables...
  }
  
interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare module 'react-helmet';