import { type Request, type Response } from "express";
import * as productosService from "./productos.service.js";

function getParam(req: Request, name: string): string {
  const value = req.params[name];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export async function list(req: Request, res: Response) {
  const query = productosService.productQuerySchema.parse(req.query);
  res.json(await productosService.listProducts(query));
}

export async function create(req: Request, res: Response) {
  const input = productosService.productInputSchema.parse(req.body);
  res.status(201).json(await productosService.createProduct(input));
}

export async function update(req: Request, res: Response) {
  const input = productosService.updateProductSchema.parse(req.body);
  res.json(await productosService.updateProduct(getParam(req, "id"), input));
}

export async function remove(req: Request, res: Response) {
  res.json(await productosService.deleteProduct(getParam(req, "id")));
}
