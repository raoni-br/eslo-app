/*
  Warnings:

  - Made the column `levelId` on table `Lesson` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Lesson" ALTER COLUMN "levelId" SET NOT NULL;
