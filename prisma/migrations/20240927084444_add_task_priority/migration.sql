/*
  Warnings:

  - A unique constraint covering the columns `[title,creatorId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "priority" "TaskPriority" NOT NULL DEFAULT 'LOW';

-- CreateIndex
CREATE UNIQUE INDEX "Project_title_creatorId_key" ON "Project"("title", "creatorId");
