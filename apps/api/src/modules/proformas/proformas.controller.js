import * as proformaService from "./proformas.service.js";
import {
  createProformaSchema,
  proformaQuerySchema,
  updateProformaSchema,
} from "./proformas.validation.js";

export async function list(req, res) {
  const query = proformaQuerySchema.parse(req.query);
  res.json(await proformaService.listProformas(query));
}

export async function getOne(req, res) {
  res.json(await proformaService.findProforma(req.params.id));
}

export async function create(req, res) {
  const input = createProformaSchema.parse(req.body);
  res.status(201).json(await proformaService.createProforma(input, req.user.id));
}

export async function update(req, res) {
  const input = updateProformaSchema.parse(req.body);
  res.json(await proformaService.updateProforma(req.params.id, input));
}

export async function remove(req, res) {
  res.json(await proformaService.deleteProforma(req.params.id));
}

export async function previewNumber(_req, res) {
  res.json({ numero: await proformaService.previewNextProformaNumber() });
}
