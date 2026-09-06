import "dotenv/config";
import { z } from "zod";

// Carga el .env de la carpeta actual (apps/backend/.env).
// En Docker, las variables llegan por el entorno del contenedor
// (docker compose --env-file .env.production).

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(10),
});

export const env = envSchema.parse(process.env);
