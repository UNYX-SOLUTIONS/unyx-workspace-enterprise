export const env = {
  appName: import.meta.env.VITE_APP_NAME || "UNYX Workspace",
  apiUrl: import.meta.env.VITE_API_URL || "/api",
} as const;

export type FrontendEnv = typeof env;
