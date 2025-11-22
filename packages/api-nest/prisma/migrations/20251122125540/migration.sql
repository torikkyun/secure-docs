/*
  Warnings:

  - You are about to drop the column `blockchain_file_id` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `kms_encrypted_key` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `tx_hash` on the `files` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "access_grants" ADD COLUMN     "tx_hash" VARCHAR(66),
ALTER COLUMN "signature" DROP NOT NULL;

-- AlterTable
ALTER TABLE "files" DROP COLUMN "blockchain_file_id",
DROP COLUMN "kms_encrypted_key",
DROP COLUMN "tx_hash";
