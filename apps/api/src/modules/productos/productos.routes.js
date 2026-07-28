import { Router } from "express";
export const productosRouter = Router();
productosRouter.get("/", (req, res) => res.json([]));
