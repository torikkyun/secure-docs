/*
  Warnings:

  - Made the column `pin_service` on table `ipfs_pins` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pin_size` on table `ipfs_pins` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ipfs_pins" ALTER COLUMN "pin_service" SET NOT NULL,
ALTER COLUMN "pin_size" SET NOT NULL;
