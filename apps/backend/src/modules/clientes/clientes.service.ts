import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../middleware/errorHandler.js";
import { clientSchema, clientStatusEnum } from "@unyx/shared-schemas";

export const createClientSchema = clientSchema.extend({
  estado: clientStatusEnum.default("Activo"),
});

export const updateClientSchema = createClientSchema.partial();

export const clientQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().trim().optional(),
});

export async function listClients({
  page,
  pageSize,
  search,
}: z.infer<typeof clientQuerySchema>) {
  const where = {
    deletedAt: null,
    ...(search
      ? {
          OR: [
            { nombre: { contains: search, mode: "insensitive" as const } },
            { ruc: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
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

  return {
    data,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

export async function createClient(input: z.infer<typeof createClientSchema>) {
  const existing = await prisma.client.findUnique({ where: { ruc: input.ruc } });
  if (existing) {
    throw new AppError(409, "CONFLICT", "Ya existe un cliente con ese RUC");
  }
  return prisma.client.create({ data: input });
}

export async function updateClient(
  id: string,
  input: z.infer<typeof updateClientSchema>
) {
  return prisma.client.update({ where: { id }, data: input });
}

export async function deleteClient(id: string) {
  await prisma.client.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return { id };
}
