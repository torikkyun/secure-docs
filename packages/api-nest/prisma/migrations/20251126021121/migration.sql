-- DropForeignKey
ALTER TABLE "downloads" DROP CONSTRAINT "downloads_access_grant_id_fkey";

-- AlterTable
ALTER TABLE "downloads" ALTER COLUMN "access_grant_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_access_grant_id_fkey" FOREIGN KEY ("access_grant_id") REFERENCES "access_grants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
