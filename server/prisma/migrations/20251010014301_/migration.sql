/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `audit_statuses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `user_statuses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "audit_statuses_name_key" ON "audit_statuses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_statuses_name_key" ON "user_statuses"("name");
