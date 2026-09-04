-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'COMERCIAL', 'TECNICO', 'CLIENTE');

CREATE TYPE "EstadoProforma" AS ENUM ('BORRADOR', 'EMITIDA', 'ACEPTADA', 'CERRADA');

CREATE TYPE "EstadoMantenimiento" AS ENUM ('EN_REVISION', 'EN_MANTENIMIENTO', 'FINALIZADO', 'ENTREGADO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'COMERCIAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'Activo',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "marca" TEXT,
    "categoria" TEXT,
    "precio" DECIMAL(12,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Proforma" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "validezDias" INTEGER NOT NULL DEFAULT 30,
    "notas" TEXT,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "iva" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "estado" "EstadoProforma" NOT NULL DEFAULT 'BORRADOR',
    "clientId" TEXT NOT NULL,
    "createdById" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proforma_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProformaItem" (
    "id" TEXT NOT NULL,
    "cantidad" DECIMAL(12,2) NOT NULL,
    "precio" DECIMAL(12,2) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "marca" TEXT,
    "codigo" TEXT,
    "proformaId" TEXT NOT NULL,
    "productId" TEXT,

    CONSTRAINT "ProformaItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Maintenance" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoMantenimiento" NOT NULL DEFAULT 'EN_REVISION',
    "tecnicoResponsable" TEXT,
    "cliente" JSONB,
    "equipo" JSONB,
    "problemasReportados" TEXT[],
    "diagnosticoInicial" JSONB,
    "diagnosticoFinal" JSONB,
    "checklist" JSONB,
    "accionesRealizadas" TEXT,
    "hallazgos" TEXT[],
    "recomendaciones" TEXT[],
    "conclusion" TEXT,
    "observaciones" TEXT,
    "notas" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Sequence" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sequence_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE UNIQUE INDEX "Client_ruc_key" ON "Client"("ruc");

CREATE UNIQUE INDEX "Product_codigo_key" ON "Product"("codigo");

CREATE UNIQUE INDEX "Proforma_numero_key" ON "Proforma"("numero");

CREATE UNIQUE INDEX "Proforma_sequenceNumber_key" ON "Proforma"("sequenceNumber");

CREATE UNIQUE INDEX "Maintenance_numero_key" ON "Maintenance"("numero");

CREATE UNIQUE INDEX "Maintenance_sequenceNumber_key" ON "Maintenance"("sequenceNumber");

-- AddForeignKey
ALTER TABLE "Proforma" ADD CONSTRAINT "Proforma_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Proforma" ADD CONSTRAINT "Proforma_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProformaItem" ADD CONSTRAINT "ProformaItem_proformaId_fkey" FOREIGN KEY ("proformaId") REFERENCES "Proforma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProformaItem" ADD CONSTRAINT "ProformaItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
