import { expect, test } from "@playwright/test";

test.describe("autenticación", () => {
  test("redirige al login al visitar rutas protegidas", async ({ page }) => {
    await page.goto("/proformas");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("inicia sesión con el usuario administrador", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Correo").fill("admin@unyxsolutions.com");
    await page.getByLabel("Contraseña").fill("Admin123!");
    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText(/Bienvenido/)).toBeVisible();
  });

  test("rechaza credenciales inválidas con toast de error", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Correo").fill("admin@unyxsolutions.com");
    await page.getByLabel("Contraseña").fill("incorrecta");
    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page.getByText(/Credenciales inválidas/)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
