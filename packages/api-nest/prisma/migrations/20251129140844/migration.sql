/*
  Warnings:

  - Added the required column `signature` to the `access_grants` table without a default value. This is not possible if the table is not empty.
  - Made the column `tx_hash` on table `access_grants` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `signature` to the `user_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "access_grants" ADD COLUMN     "signature" TEXT NOT NULL,
ALTER COLUMN "tx_hash" SET NOT NULL;

-- AlterTable
ALTER TABLE "user_sessions" ADD COLUMN     "signature" TEXT NOT NULL;
