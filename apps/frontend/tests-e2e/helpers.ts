import { test, expect } from "@playwright/test";

export async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Correo").fill("admin@unyxsolutions.com");
  await page.getByLabel("Contraseña").fill("Admin123!");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}
