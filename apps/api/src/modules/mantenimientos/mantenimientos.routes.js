import { Router } from "express";
export const mantenimientosRouter = Router();
mantenimientosRouter.get("/", (req, res) => res.json([]));
