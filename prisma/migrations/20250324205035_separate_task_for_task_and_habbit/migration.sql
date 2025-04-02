/*
  Warnings:

  - You are about to drop the column `baseExperience` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `minExperienceRatio` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `progressionPhase` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `stepsBeforePlateau` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `stepsOnPlateau` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `streakCount` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `weeklyFrequency` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the `TimeEntry` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TaskPoints" AS ENUM ('1', '2', '3', '5', '8', '13', '21');

-- DropForeignKey
ALTER TABLE "TimeEntry" DROP CONSTRAINT "TimeEntry_taskId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "baseExperience",
DROP COLUMN "minExperienceRatio",
DROP COLUMN "progressionPhase",
DROP COLUMN "stepsBeforePlateau",
DROP COLUMN "stepsOnPlateau",
DROP COLUMN "streakCount",
DROP COLUMN "type",
DROP COLUMN "weeklyFrequency",
ADD COLUMN     "estimatedPoints" "TaskPoints";

-- DropTable
DROP TABLE "TimeEntry";

-- DropEnum
DROP TYPE "TaskType";

-- CreateTable
CREATE TABLE "Habit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "TaskStatus" NOT NULL,
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "streakCount" INTEGER NOT NULL DEFAULT 0,
    "weeklyFrequency" INTEGER,
    "baseExperience" INTEGER NOT NULL DEFAULT 1,
    "progressionPhase" "ProgressionPhase" NOT NULL DEFAULT 'GROWTH',
    "stepsBeforePlateau" INTEGER NOT NULL,
    "stepsOnPlateau" INTEGER NOT NULL,
    "minExperienceRatio" DOUBLE PRECISION NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskTimeEntry" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,

    CONSTRAINT "TaskTimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitTimeEntry" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,

    CONSTRAINT "HabitTimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitCompletion" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "experienceGained" INTEGER NOT NULL,

    CONSTRAINT "HabitCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Habit_categoryId_idx" ON "Habit"("categoryId");

-- CreateIndex
CREATE INDEX "TaskTimeEntry_taskId_idx" ON "TaskTimeEntry"("taskId");

-- CreateIndex
CREATE INDEX "HabitTimeEntry_habitId_idx" ON "HabitTimeEntry"("habitId");

-- CreateIndex
CREATE INDEX "HabitCompletion_habitId_idx" ON "HabitCompletion"("habitId");

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTimeEntry" ADD CONSTRAINT "TaskTimeEntry_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitTimeEntry" ADD CONSTRAINT "HabitTimeEntry_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitCompletion" ADD CONSTRAINT "HabitCompletion_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
