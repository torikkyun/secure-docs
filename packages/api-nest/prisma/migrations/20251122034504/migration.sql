/*
  Warnings:

  - You are about to drop the column `kms_key_name` on the `users` table. All the data in the column will be lost.
  - Made the column `public_key` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "users_kms_key_name_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "kms_key_name",
ALTER COLUMN "public_key" SET NOT NULL;
