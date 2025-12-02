/*
  Warnings:

  - You are about to drop the column `file_size_downloaded` on the `downloads` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "downloads" DROP COLUMN "file_size_downloaded";
