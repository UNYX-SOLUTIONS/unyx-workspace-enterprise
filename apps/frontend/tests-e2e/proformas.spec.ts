import { expect } from "@playwright/test";
import { test } from "./fixtures";

test.describe("proformas", () => {
  test("carga el historial de proformas", async ({ page }) => {
    await page.goto("/proformas");

    await expect(page.getByRole("heading", { name: "Historial de Proformas" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Nueva Proforma/ })).toBeVisible();
    await expect(page.getByPlaceholder("Buscar proforma...")).toBeVisible();
  });

  test("crea una proforma completa de extremo a extremo", async ({ page }) => {
    await page.goto("/proformas/nueva");

    await expect(page.getByRole("heading", { name: "Crear Nueva Proforma" })).toBeVisible();

    const numero = page.getByLabel("Número");
    await expect(numero).not.toHaveValue("");

    const unique = String(Date.now()).slice(-10);
    const nombreCliente = `Cliente E2E ${unique}`;
    const ruc = `099${unique}`;

    await page.getByPlaceholder("Buscar por nombre, RUC o correo...").click();
    await page.getByRole("button", { name: /Crear nuevo cliente/ }).click();

    await page.getByLabel("Nombre / Razón Social").fill(nombreCliente);
    await page.getByLabel("RUC / Identificación").fill(ruc);
    await page.getByRole("button", { name: /Guardar Cliente/ }).click();

    await expect(page.getByText(/Cliente creado y seleccionado/)).toBeVisible();
    await expect(page.getByLabel("Razón Social / Nombre")).toHaveValue(nombreCliente);

    await page
      .getByPlaceholder("Buscar producto por nombre, código o marca...")
      .click();
    await page.getByRole("button", { name: /Crear producto nuevo/ }).click();

    const refProducto = `E2E-${unique}`;
    await page.getByLabel("Referencia").fill(refProducto);
    await page.getByLabel("Nombre del Producto").fill("Producto E2E");
    await page.getByLabel("Precio").fill("100.5");
    await page.getByRole("button", { name: /Guardar Producto/ }).click();

    await expect(page.getByText(/Producto creado y añadido/)).toBeVisible();
    await expect(page.locator('input[value="Producto E2E"]')).toBeVisible();

    await expect(page.getByText("Subtotal", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("TOTAL", { exact: true }).first()).toBeVisible();

    await page.getByRole("button", { name: "Emitir Proforma" }).click();

    await expect(page.getByText(/emitida correctamente/i)).toBeVisible();
    await expect(page.getByLabel("Número")).not.toHaveValue("");
  });
});
