/*
  Warnings:

  - You are about to drop the column `baseExperience` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `minExperienceRatio` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "baseExperience",
DROP COLUMN "minExperienceRatio",
ADD COLUMN     "minDeclineExperienceRatio" DOUBLE PRECISION,
ADD COLUMN     "minGrowthExperienceRatio" DOUBLE PRECISION;
