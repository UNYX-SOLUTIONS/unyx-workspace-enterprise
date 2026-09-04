import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import * as controller from "./productos.controller.js";

export const productosRouter = Router();

productosRouter.use(requireAuth);

productosRouter.get("/", controller.list);
productosRouter.post("/", controller.create);
productosRouter.put("/:id", controller.update);
productosRouter.delete("/:id", controller.remove);
