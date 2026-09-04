import { resolve } from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

// 1. .env local de la app (apps/backend/.env) — desarrollo
dotenv.config();

// 2. .env.<entorno> en la raíz del monorepo (desarrollo/producción)
const nodeEnv = process.env.NODE_ENV || "development";
dotenv.config({
  path: resolve(import.meta.dirname, "../../../../.env." + nodeEnv),
  override: false,
});

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
