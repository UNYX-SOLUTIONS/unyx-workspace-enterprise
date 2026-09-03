import { type Request, type Response } from "express";
import * as proformaService from "./proformas.service.js";
import {
  createProformaSchema,
  proformaQuerySchema,
  updateProformaSchema,
} from "./proformas.validation.js";

function getParam(req: Request, name: string): string {
  const value = req.params[name];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export async function list(req: Request, res: Response) {
  const query = proformaQuerySchema.parse(req.query);
  res.json(await proformaService.listProformas(query));
}

export async function getOne(req: Request, res: Response) {
  res.json(await proformaService.findProforma(getParam(req, "id")));
}

export async function create(req: Request, res: Response) {
  const input = createProformaSchema.parse(req.body);
  res.status(201).json(await proformaService.createProforma(input, req.user!.id));
}

export async function update(req: Request, res: Response) {
  const input = updateProformaSchema.parse(req.body);
  res.json(await proformaService.updateProforma(getParam(req, "id"), input));
}

export async function remove(req: Request, res: Response) {
  res.json(await proformaService.deleteProforma(getParam(req, "id")));
}

export async function previewNumber(_req: Request, res: Response) {
  res.json({ numero: await proformaService.previewNextProformaNumber() });
}
