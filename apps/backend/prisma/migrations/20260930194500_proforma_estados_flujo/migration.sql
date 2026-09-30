-- Flujo de estados de proforma:
-- BORRADOR -> EMITIDA -> ENVIADA -> APROBADA (y CANCELADA desde cualquier estado)
-- Se reemplaza el enum conservando los datos:
--   ACEPTADA y CERRADA -> APROBADA

CREATE TYPE "EstadoProforma_new" AS ENUM ('BORRADOR', 'EMITIDA', 'ENVIADA', 'APROBADA', 'CANCELADA');

ALTER TABLE "Proforma" ALTER COLUMN "estado" DROP DEFAULT;

ALTER TABLE "Proforma"
  ALTER COLUMN "estado" TYPE "EstadoProforma_new"
  USING (
    CASE
      WHEN "estado"::text IN ('ACEPTADA', 'CERRADA') THEN 'APROBADA'
      ELSE "estado"::text
    END
  )::"EstadoProforma_new";

ALTER TABLE "Proforma" ALTER COLUMN "estado" SET DEFAULT 'BORRADOR';

DROP TYPE "EstadoProforma";

ALTER TYPE "EstadoProforma_new" RENAME TO "EstadoProforma";
