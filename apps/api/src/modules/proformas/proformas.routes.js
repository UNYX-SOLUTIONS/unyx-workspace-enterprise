import { Router } from "express";
import { prisma } from "../../config/prisma.js";

export const proformasRouter = Router();

proformasRouter.get("/", async (req, res, next) => {
  try {
    const rows = await prisma.proforma.findMany({
      include: { cliente: true, items: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(rows);
  } catch (error) {
    next(error);
  }
});
