import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middleware/auth.js";
import { clientSchema, clientStatusEnum } from "@unyx/shared-schemas";

export const clientesRouter = Router();

clientesRouter.use(requireAuth);

const createClientSchema = clientSchema.extend({
  estado: clientStatusEnum.default("Activo"),
});

const updateClientSchema = createClientSchema.partial();

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().trim().optional(),
});

clientesRouter.get("/", async (req, res) => {
  const { page, pageSize, search } = listQuerySchema.parse(req.query);

  const where = {
    deletedAt: null,
    ...(search
      ? {
          OR: [
            { nombre: { contains: search, mode: "insensitive" } },
            { ruc: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.client.count({ where }),
  ]);

  res.json({
    data,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
});

clientesRouter.post("/", async (req, res) => {
  const input = createClientSchema.parse(req.body);

  const existing = await prisma.client.findUnique({ where: { ruc: input.ruc } });
  if (existing) {
    return res.status(409).json({ error: "Ya existe un cliente con ese RUC", code: "CONFLICT" });
  }

  res.status(201).json(await prisma.client.create({ data: input }));
});

clientesRouter.put("/:id", async (req, res) => {
  const input = updateClientSchema.parse(req.body);
  res.json(await prisma.client.update({ where: { id: req.params.id }, data: input }));
});

clientesRouter.delete("/:id", async (req, res) => {
  await prisma.client.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  });
  res.json({ id: req.params.id });
});
