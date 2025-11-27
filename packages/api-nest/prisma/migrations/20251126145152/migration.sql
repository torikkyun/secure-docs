/*
  Warnings:

  - You are about to drop the column `grant_message` on the `access_grants` table. All the data in the column will be lost.
  - You are about to drop the column `signature` on the `access_grants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "access_grants" DROP COLUMN "grant_message",
DROP COLUMN "signature";
