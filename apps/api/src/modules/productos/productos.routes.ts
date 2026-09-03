import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middleware/auth.js";

export const productosRouter = Router();

productosRouter.use(requireAuth);

const productInputSchema = z.object({
  ref: z.string().trim().min(1),
  name: z.string().trim().min(1),
  brand: z.string().optional(),
  category: z.string().optional(),
  price: z.coerce.number().nonnegative(),
});

const updateProductSchema = productInputSchema.partial();

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().trim().optional(),
});

type ProductInput = z.infer<typeof productInputSchema>;
type ProductUpdateInput = z.infer<typeof updateProductSchema>;

function toCreateInput(payload: ProductInput) {
  return {
    codigo: payload.ref,
    nombre: payload.name,
    marca: payload.brand,
    categoria: payload.category,
    precio: payload.price,
  };
}

function toUpdateInput(payload: ProductUpdateInput): Prisma.ProductUpdateInput {
  const data: Prisma.ProductUpdateInput = {};
  if (payload.ref !== undefined) data.codigo = payload.ref;
  if (payload.name !== undefined) data.nombre = payload.name;
  if (payload.brand !== undefined) data.marca = payload.brand;
  if (payload.category !== undefined) data.categoria = payload.category;
  if (payload.price !== undefined) data.precio = payload.price;
  return data;
}

productosRouter.get("/", async (req, res) => {
  const { page, pageSize, search } = listQuerySchema.parse(req.query);

  const where = {
    activo: true,
    ...(search
      ? {
          OR: [
            { codigo: { contains: search, mode: "insensitive" as const } },
            { nombre: { contains: search, mode: "insensitive" as const } },
            { marca: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    data,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
});

productosRouter.post("/", async (req, res) => {
  const input = productInputSchema.parse(req.body);
  const existing = await prisma.product.findUnique({ where: { codigo: input.ref } });
  if (existing) {
    return res.status(409).json({ error: "Ya existe un producto con esa referencia", code: "CONFLICT" });
  }
  res.status(201).json(await prisma.product.create({ data: toCreateInput(input) }));
});

productosRouter.put("/:id", async (req, res) => {
  const input = updateProductSchema.parse(req.body);
  res.json(await prisma.product.update({ where: { id: req.params.id }, data: toUpdateInput(input) }));
});

productosRouter.delete("/:id", async (req, res) => {
  await prisma.product.update({ where: { id: req.params.id }, data: { activo: false } });
  res.json({ id: req.params.id });
});
