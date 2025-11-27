/*
  Warnings:

  - You are about to drop the `receipt_status` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `receipts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "receipts" DROP CONSTRAINT "receipts_access_grant_id_fkey";

-- DropForeignKey
ALTER TABLE "receipts" DROP CONSTRAINT "receipts_file_id_fkey";

-- DropForeignKey
ALTER TABLE "receipts" DROP CONSTRAINT "receipts_recipient_id_fkey";

-- DropForeignKey
ALTER TABLE "receipts" DROP CONSTRAINT "receipts_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "receipts" DROP CONSTRAINT "receipts_status_id_fkey";

-- DropTable
DROP TABLE "receipt_status";

-- DropTable
DROP TABLE "receipts";
