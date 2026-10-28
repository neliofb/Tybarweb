/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_MOCK?: string
  readonly VITE_DISCORD_CONVITE?: string
  readonly VITE_LAUNCHER_URL?: string
  readonly VITE_LAUNCHER_MAC_URL?: string
}
interface ImportMeta { readonly env: ImportMetaEnv }
