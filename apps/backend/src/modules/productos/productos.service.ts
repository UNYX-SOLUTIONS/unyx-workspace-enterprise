import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../middleware/errorHandler.js";

export const productInputSchema = z.object({
  ref: z.string().trim().min(1),
  name: z.string().trim().min(1),
  brand: z.string().optional(),
  category: z.string().optional(),
  price: z.coerce.number().nonnegative(),
});

export const updateProductSchema = productInputSchema.partial();

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().trim().optional(),
});

function toCreateInput(payload: z.infer<typeof productInputSchema>) {
  return {
    codigo: payload.ref,
    nombre: payload.name,
    marca: payload.brand,
    categoria: payload.category,
    precio: payload.price,
  };
}

function toUpdateInput(payload: z.infer<typeof updateProductSchema>): Prisma.ProductUpdateInput {
  const data: Prisma.ProductUpdateInput = {};
  if (payload.ref !== undefined) data.codigo = payload.ref;
  if (payload.name !== undefined) data.nombre = payload.name;
  if (payload.brand !== undefined) data.marca = payload.brand;
  if (payload.category !== undefined) data.categoria = payload.category;
  if (payload.price !== undefined) data.precio = payload.price;
  return data;
}

export async function listProducts({
  page,
  pageSize,
  search,
}: z.infer<typeof productQuerySchema>) {
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

  return {
    data,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

export async function createProduct(input: z.infer<typeof productInputSchema>) {
  const existing = await prisma.product.findUnique({ where: { codigo: input.ref } });
  if (existing) {
    throw new AppError(409, "CONFLICT", "Ya existe un producto con esa referencia");
  }
  return prisma.product.create({ data: toCreateInput(input) });
}

export async function updateProduct(
  id: string,
  input: z.infer<typeof updateProductSchema>
) {
  return prisma.product.update({ where: { id }, data: toUpdateInput(input) });
}

export async function deleteProduct(id: string) {
  await prisma.product.update({ where: { id }, data: { activo: false } });
  return { id };
}
