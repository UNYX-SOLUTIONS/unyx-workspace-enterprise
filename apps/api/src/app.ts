import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { proformasRouter } from "./modules/proformas/proformas.routes.js";
import { clientesRouter } from "./modules/clientes/clientes.routes.js";
import { productosRouter } from "./modules/productos/productos.routes.js";
import { mantenimientosRouter } from "./modules/mantenimientos/mantenimientos.routes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === "/api/health" } }));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 300 }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  message: { error: "Demasiados intentos de inicio de sesión", code: "TOO_MANY_REQUESTS" },
});

app.use("/api/health", healthRouter);
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", authRouter);
app.use("/api/proformas", proformasRouter);
app.use("/api/clientes", clientesRouter);
app.use("/api/productos", productosRouter);
app.use("/api/mantenimientos", mantenimientosRouter);

app.use(notFound);
app.use(errorHandler);
