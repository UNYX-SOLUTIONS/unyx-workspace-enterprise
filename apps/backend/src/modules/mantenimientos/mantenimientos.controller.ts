import { type Request, type Response } from "express";
import * as mantenimientosService from "./mantenimientos.service.js";
import {
  createMaintenanceSchema,
  maintenanceQuerySchema,
  updateMaintenanceSchema,
} from "./mantenimientos.validation.js";

function getParam(req: Request, name: string): string {
  const value = req.params[name];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export async function list(req: Request, res: Response) {
  const query = maintenanceQuerySchema.parse(req.query);
  res.json(await mantenimientosService.listMaintenances(query));
}

export async function getOne(req: Request, res: Response) {
  res.json(await mantenimientosService.findMaintenance(getParam(req, "id")));
}

export async function create(req: Request, res: Response) {
  const input = createMaintenanceSchema.parse(req.body);
  res.status(201).json(await mantenimientosService.createMaintenance(input, req.user!.id));
}

export async function update(req: Request, res: Response) {
  const input = updateMaintenanceSchema.parse(req.body);
  res.json(await mantenimientosService.updateMaintenance(getParam(req, "id"), input));
}

export async function remove(req: Request, res: Response) {
  res.json(await mantenimientosService.deleteMaintenance(getParam(req, "id")));
}

export async function previewNumber(_req: Request, res: Response) {
  res.json({ numero: await mantenimientosService.previewNextMaintenanceNumber() });
}
