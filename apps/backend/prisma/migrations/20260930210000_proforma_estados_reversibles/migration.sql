-- Estados de proforma: todos reversibles, sin flujo secuencial.
-- Conjunto final: BORRADOR, ENVIADA, ACEPTADA, CANCELADA, EXPIRADA
-- Mapeo de datos: EMITIDA -> ENVIADA, APROBADA -> ACEPTADA

CREATE TYPE "EstadoProforma_new" AS ENUM ('BORRADOR', 'ENVIADA', 'ACEPTADA', 'CANCELADA', 'EXPIRADA');

ALTER TABLE "Proforma" ALTER COLUMN "estado" DROP DEFAULT;

ALTER TABLE "Proforma"
  ALTER COLUMN "estado" TYPE "EstadoProforma_new"
  USING (
    CASE
      WHEN "estado"::text = 'EMITIDA' THEN 'ENVIADA'
      WHEN "estado"::text = 'APROBADA' THEN 'ACEPTADA'
      ELSE "estado"::text
    END
  )::"EstadoProforma_new";

ALTER TABLE "Proforma" ALTER COLUMN "estado" SET DEFAULT 'BORRADOR';

DROP TYPE "EstadoProforma";

ALTER TYPE "EstadoProforma_new" RENAME TO "EstadoProforma";
