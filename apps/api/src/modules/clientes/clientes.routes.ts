import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import * as controller from "./clientes.controller.js";

export const clientesRouter = Router();

clientesRouter.use(requireAuth);

clientesRouter.get("/", controller.list);
clientesRouter.post("/", controller.create);
clientesRouter.put("/:id", controller.update);
clientesRouter.delete("/:id", controller.remove);
