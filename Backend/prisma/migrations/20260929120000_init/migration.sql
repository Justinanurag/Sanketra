-- Enable pgvector before the embedding column is created.
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "reports" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "report_type" VARCHAR(50) NOT NULL,
    "site_location" VARCHAR(255),
    "incident_date" TIMESTAMP(3),
    "hazard_name" VARCHAR(255),
    "energy_source" VARCHAR(255),
    "human_exposure" TEXT,
    "barrier_name" VARCHAR(255),
    "barrier_status" VARCHAR(50),
    "consequence" TEXT,
    "notes" TEXT,
    "sif_potential" VARCHAR(50),
    "analysis" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_embeddings" (
    "id" SERIAL NOT NULL,
    "report_id" INTEGER NOT NULL,
    "embedding" vector(768),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "report_id" INTEGER NOT NULL,
    "reviewer" VARCHAR(255) NOT NULL,
    "role" VARCHAR(255),
    "decision" VARCHAR(50) NOT NULL,
    "comments" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_events" (
    "id" SERIAL NOT NULL,
    "report_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "sif_potential" VARCHAR(50) NOT NULL,
    "decision" VARCHAR(50) NOT NULL,
    "reviewer" VARCHAR(255) NOT NULL,
    "hazard_name" VARCHAR(255),
    "barrier_status" VARCHAR(50),
    "summary" TEXT,
    "decided_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "user_name" VARCHAR(255) NOT NULL,
    "action" VARCHAR(255) NOT NULL,
    "entity" VARCHAR(255) NOT NULL,
    "entity_id" VARCHAR(255),
    "previous_value" TEXT,
    "new_value" TEXT,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "report_embeddings" ADD CONSTRAINT "report_embeddings_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_events" ADD CONSTRAINT "safety_events_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
