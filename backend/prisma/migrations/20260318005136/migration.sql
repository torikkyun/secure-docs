/*
  Warnings:

  - The values [UPLOAD] on the enum `FileActivityAction` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FileActivityAction_new" AS ENUM ('SHARE', 'DOWNLOAD', 'DELETE', 'REVOKE_SHARE');
ALTER TABLE "file_activities" ALTER COLUMN "action" TYPE "FileActivityAction_new" USING ("action"::text::"FileActivityAction_new");
ALTER TYPE "FileActivityAction" RENAME TO "FileActivityAction_old";
ALTER TYPE "FileActivityAction_new" RENAME TO "FileActivityAction";
DROP TYPE "public"."FileActivityAction_old";
COMMIT;
