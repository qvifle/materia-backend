/*
  Warnings:

  - A unique constraint covering the columns `[title,projectId]` on the table `Desk` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,deskId]` on the table `Task` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Desk_title_key";

-- DropIndex
DROP INDEX "Task_title_key";

-- CreateIndex
CREATE UNIQUE INDEX "Desk_title_projectId_key" ON "Desk"("title", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Task_title_deskId_key" ON "Task"("title", "deskId");
