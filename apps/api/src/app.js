import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
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
app.use(morgan("dev"));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 300 }));

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/proformas", proformasRouter);
app.use("/api/clientes", clientesRouter);
app.use("/api/productos", productosRouter);
app.use("/api/mantenimientos", mantenimientosRouter);

app.use(notFound);
app.use(errorHandler);
