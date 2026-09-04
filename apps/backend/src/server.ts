import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, "UNYX API iniciada");
});

function shutdown(signal: string) {
  logger.info({ signal }, "cerrando servidor");
  server.close((error) => {
    if (error) {
      logger.error({ err: error }, "error al cerrar el servidor");
      process.exit(1);
    }
    process.exit(0);
  });

  setTimeout(() => {
    logger.warn("cierre forzado por tiempo de espera");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
