import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://unyx:unyx_password@localhost:5432/unyx_workspace",
      JWT_SECRET: "test-secret-very-long-enough",
      CORS_ORIGIN: "http://localhost:5173",
    },
  },
});
