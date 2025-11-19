/*
  Warnings:

  - You are about to drop the column `public_key` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "public_key",
ADD COLUMN     "kms_key_name" TEXT;
