/*
  Warnings:

  - Made the column `google_id` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "google_id" SET NOT NULL,
ALTER COLUMN "name" SET NOT NULL;
