import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import * as controller from "./mantenimientos.controller.js";

export const mantenimientosRouter = Router();

mantenimientosRouter.use(requireAuth);

mantenimientosRouter.get("/numero-siguiente", controller.previewNumber);
mantenimientosRouter.get("/", controller.list);
mantenimientosRouter.get("/:id", controller.getOne);
mantenimientosRouter.post("/", controller.create);
mantenimientosRouter.put("/:id", controller.update);
mantenimientosRouter.delete("/:id", controller.remove);
