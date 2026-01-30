/*
  Warnings:

  - You are about to drop the column `enable_blockchain_logging` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "enable_blockchain_logging";
