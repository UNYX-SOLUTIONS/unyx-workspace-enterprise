import { test } from "./fixtures";

test("verifica sidebar estático al hacer scroll", async ({ page }) => {
  await page.route("**fonts.googleapis.com**", (route) => route.abort());
  await page.route("**fonts.gstatic.com**", (route) => route.abort());

  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/proformas");
  await page.waitForTimeout(900);

  const sidebar = page.locator("aside");
  const before = await sidebar.boundingBox();

  const main = page.locator("main");
  await main.evaluate((element) => {
    element.scrollTop = 600;
  });
  await page.waitForTimeout(400);

  const after = await sidebar.boundingBox();

  await page.screenshot({ path: "captura-scroll.png", fullPage: false, animations: "disabled" });

  console.log(`SIDEBAR antes: y=${before?.y} | despues: y=${after?.y}`);

  if (!before || !after || Math.abs(after.y - before.y) > 1) {
    throw new Error(`El sidebar se movió con el scroll: y ${before?.y} -> ${after?.y}`);
  }
});
