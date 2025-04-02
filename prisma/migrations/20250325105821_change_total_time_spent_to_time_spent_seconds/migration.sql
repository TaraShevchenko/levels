/*
  Warnings:

  - You are about to drop the column `totalTimeSpent` on the `Habit` table. All the data in the column will be lost.
  - You are about to drop the column `totalTimeSpent` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Habit" DROP COLUMN "totalTimeSpent",
ADD COLUMN     "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "totalTimeSpent",
ADD COLUMN     "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0;
