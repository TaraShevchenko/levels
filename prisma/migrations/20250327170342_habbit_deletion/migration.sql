/*
  Warnings:

  - You are about to drop the column `timeSpentSeconds` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the `Habit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HabitCompletion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HabitTimeEntry` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `abbreviation` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minExperienceRatio` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stepsBeforePlateau` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stepsOnPlateau` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Habit" DROP CONSTRAINT "Habit_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "HabitCompletion" DROP CONSTRAINT "HabitCompletion_habitId_fkey";

-- DropForeignKey
ALTER TABLE "HabitTimeEntry" DROP CONSTRAINT "HabitTimeEntry_habitId_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "abbreviation" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "timeSpentSeconds",
ADD COLUMN     "baseExperience" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "minExperienceRatio" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "progressionPhase" "ProgressionPhase" NOT NULL DEFAULT 'GROWTH',
ADD COLUMN     "stepsBeforePlateau" INTEGER NOT NULL,
ADD COLUMN     "stepsOnPlateau" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Habit";

-- DropTable
DROP TABLE "HabitCompletion";

-- DropTable
DROP TABLE "HabitTimeEntry";
