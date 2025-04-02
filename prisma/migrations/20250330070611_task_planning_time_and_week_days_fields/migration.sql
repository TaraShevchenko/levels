-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('1', '2', '3', '4', '5', '6', '7');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "weekDays" "WeekDay"[],
ALTER COLUMN "plannedEndTime" SET DATA TYPE TIME,
ALTER COLUMN "plannedStartTime" SET DATA TYPE TIME;
