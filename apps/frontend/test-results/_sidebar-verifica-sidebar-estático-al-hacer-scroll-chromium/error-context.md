# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: _sidebar.spec.ts >> verifica sidebar estático al hacer scroll
- Location: tests-e2e\_sidebar.spec.ts:3:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/login
Call log:
  - navigating to "http://localhost:5173/login", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | export async function login(page: import("@playwright/test").Page) {
> 4  |   await page.goto("/login");
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/login
  5  |   await page.getByLabel("Correo").fill("admin@unyxsolutions.com");
  6  |   await page.getByLabel("Contraseña").fill("Admin123!");
  7  |   await page.getByRole("button", { name: "Ingresar" }).click();
  8  |   await expect(page).toHaveURL(/\/dashboard$/);
  9  | }
  10 | 
```