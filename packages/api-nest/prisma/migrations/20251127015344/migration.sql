/*
  Warnings:

  - You are about to drop the `blockchain_sync` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blockchain_sync_status` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `file_shares_summary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `system_settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "blockchain_sync" DROP CONSTRAINT "blockchain_sync_status_id_fkey";

-- DropForeignKey
ALTER TABLE "file_shares_summary" DROP CONSTRAINT "file_shares_summary_file_id_fkey";

-- DropForeignKey
ALTER TABLE "system_settings" DROP CONSTRAINT "system_settings_updated_by_id_fkey";

-- DropTable
DROP TABLE "blockchain_sync";

-- DropTable
DROP TABLE "blockchain_sync_status";

-- DropTable
DROP TABLE "file_shares_summary";

-- DropTable
DROP TABLE "system_settings";
