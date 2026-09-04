import { type Request, type Response } from "express";
import * as clientesService from "./clientes.service.js";

function getParam(req: Request, name: string): string {
  const value = req.params[name];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export async function list(req: Request, res: Response) {
  const query = clientesService.clientQuerySchema.parse(req.query);
  res.json(await clientesService.listClients(query));
}

export async function create(req: Request, res: Response) {
  const input = clientesService.createClientSchema.parse(req.body);
  res.status(201).json(await clientesService.createClient(input));
}

export async function update(req: Request, res: Response) {
  const input = clientesService.updateClientSchema.parse(req.body);
  res.json(await clientesService.updateClient(getParam(req, "id"), input));
}

export async function remove(req: Request, res: Response) {
  res.json(await clientesService.deleteClient(getParam(req, "id")));
}
