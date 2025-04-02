-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "minExperienceRatio" DROP NOT NULL,
ALTER COLUMN "progressionPhase" DROP NOT NULL,
ALTER COLUMN "progressionPhase" DROP DEFAULT,
ALTER COLUMN "stepsBeforePlateau" DROP NOT NULL,
ALTER COLUMN "stepsOnPlateau" DROP NOT NULL;
