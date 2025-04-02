/*
  Warnings:

  - The values [IN_PROGRESS] on the enum `GoalStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [DECLINE] on the enum `ProgressionPhase` will be removed. If these variants are still used in the database, this will fail.
  - The values [NOT_STARTED,IN_PROGRESS,FAILED] on the enum `TaskStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GoalStatus_new" AS ENUM ('INPROGRESS', 'COMPLETED', 'ABANDONED');
ALTER TABLE "Goal" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Goal" ALTER COLUMN "status" TYPE "GoalStatus_new" USING ("status"::text::"GoalStatus_new");
ALTER TYPE "GoalStatus" RENAME TO "GoalStatus_old";
ALTER TYPE "GoalStatus_new" RENAME TO "GoalStatus";
DROP TYPE "GoalStatus_old";
ALTER TABLE "Goal" ALTER COLUMN "status" SET DEFAULT 'INPROGRESS';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ProgressionPhase_new" AS ENUM ('GROWTH', 'PLATEAU', 'RECESSION');
ALTER TABLE "Task" ALTER COLUMN "progressionPhase" TYPE "ProgressionPhase_new" USING ("progressionPhase"::text::"ProgressionPhase_new");
ALTER TYPE "ProgressionPhase" RENAME TO "ProgressionPhase_old";
ALTER TYPE "ProgressionPhase_new" RENAME TO "ProgressionPhase";
DROP TYPE "ProgressionPhase_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TaskStatus_new" AS ENUM ('TODO', 'INPROGRESS', 'COMPLETED', 'ABANDONED');
ALTER TABLE "Task" ALTER COLUMN "status" TYPE "TaskStatus_new" USING ("status"::text::"TaskStatus_new");
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "TaskStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Goal" ALTER COLUMN "status" SET DEFAULT 'INPROGRESS';
