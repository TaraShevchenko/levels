-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "bestStreakDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currentStreakDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "experienceMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
ADD COLUMN     "lastActivityDate" TIMESTAMP(3),
ADD COLUMN     "maxExperienceMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
ADD COLUMN     "minMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
ADD COLUMN     "multiplierDecayRate" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
ADD COLUMN     "multiplierGrowthRate" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
ADD COLUMN     "requiredDailyTime" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "requiredTasksPerDay" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "actualEndTime" TIMESTAMP(3),
ADD COLUMN     "actualStartTime" TIMESTAMP(3),
ADD COLUMN     "isScheduled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "plannedEndTime" TIMESTAMP(3),
ADD COLUMN     "plannedStartTime" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "TaskCompletion" ADD COLUMN     "extraData" JSONB;
