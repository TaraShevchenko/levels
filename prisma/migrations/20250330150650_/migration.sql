/*
  Warnings:

  - The `plannedEndTime` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `plannedStartTime` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "plannedEndTime",
ADD COLUMN     "plannedEndTime" TIMESTAMP(3),
DROP COLUMN "plannedStartTime",
ADD COLUMN     "plannedStartTime" TIMESTAMP(3);
