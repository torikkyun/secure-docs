/*
  Warnings:

  - You are about to drop the column `status` on the `access_grants` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `blockchain_sync` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `downloads` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `pin_status` on the `ipfs_pins` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `receipts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "access_grants" DROP COLUMN "status",
ADD COLUMN     "status_id" VARCHAR(20) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "blockchain_sync" DROP COLUMN "status",
ADD COLUMN     "status_id" VARCHAR(20) NOT NULL DEFAULT 'confirmed';

-- AlterTable
ALTER TABLE "downloads" DROP COLUMN "status",
ADD COLUMN     "status_id" VARCHAR(20) NOT NULL DEFAULT 'success';

-- AlterTable
ALTER TABLE "files" DROP COLUMN "status",
ADD COLUMN     "status_id" VARCHAR(20) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "ipfs_pins" DROP COLUMN "pin_status",
ADD COLUMN     "pin_status_id" VARCHAR(20) NOT NULL DEFAULT 'pinned';

-- AlterTable
ALTER TABLE "receipts" DROP COLUMN "status",
ADD COLUMN     "status_id" VARCHAR(20) NOT NULL DEFAULT 'confirmed';

-- CreateTable
CREATE TABLE "file_status" (
    "id" VARCHAR(20) NOT NULL,
    "description" TEXT,

    CONSTRAINT "file_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_grant_status" (
    "id" VARCHAR(20) NOT NULL,
    "description" TEXT,

    CONSTRAINT "access_grant_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "download_status" (
    "id" VARCHAR(20) NOT NULL,
    "description" TEXT,

    CONSTRAINT "download_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipt_status" (
    "id" VARCHAR(20) NOT NULL,
    "description" TEXT,

    CONSTRAINT "receipt_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchain_sync_status" (
    "id" VARCHAR(20) NOT NULL,
    "description" TEXT,

    CONSTRAINT "blockchain_sync_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ipfs_pin_status" (
    "id" VARCHAR(20) NOT NULL,
    "description" TEXT,

    CONSTRAINT "ipfs_pin_status_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "file_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_grants" ADD CONSTRAINT "access_grants_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "access_grant_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "download_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "receipt_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockchain_sync" ADD CONSTRAINT "blockchain_sync_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "blockchain_sync_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ipfs_pins" ADD CONSTRAINT "ipfs_pins_pin_status_id_fkey" FOREIGN KEY ("pin_status_id") REFERENCES "ipfs_pin_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
