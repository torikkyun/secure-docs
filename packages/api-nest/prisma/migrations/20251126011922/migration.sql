/*
  Warnings:

  - You are about to drop the column `metadata` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `ipfs_pins` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "files" DROP COLUMN "metadata";

-- AlterTable
ALTER TABLE "ipfs_pins" DROP COLUMN "metadata";
