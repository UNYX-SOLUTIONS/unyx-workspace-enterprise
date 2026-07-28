import { Router } from "express";
export const clientesRouter = Router();
clientesRouter.get("/", (req, res) => res.json([]));
