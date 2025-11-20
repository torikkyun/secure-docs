/*
  Warnings:

  - A unique constraint covering the columns `[kms_key_name]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Made the column `username` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `kms_key_name` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "kms_key_name" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_kms_key_name_key" ON "users"("kms_key_name");
