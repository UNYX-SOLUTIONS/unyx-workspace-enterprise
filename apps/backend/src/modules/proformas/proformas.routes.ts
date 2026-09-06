import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import * as controller from "./proformas.controller.js";

export const proformasRouter = Router();

proformasRouter.use(requireAuth);

proformasRouter.get("/numero-siguiente", controller.previewNumber);
proformasRouter.get("/", controller.list);
proformasRouter.get("/:id", controller.getOne);
proformasRouter.post("/", controller.create);
proformasRouter.put("/:id", controller.update);
proformasRouter.delete("/:id", controller.remove);
