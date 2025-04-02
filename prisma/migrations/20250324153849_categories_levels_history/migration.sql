/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "CategoryLevelHistory" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalExperience" INTEGER NOT NULL,

    CONSTRAINT "CategoryLevelHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CategoryLevelHistory_categoryId_idx" ON "CategoryLevelHistory"("categoryId");

-- AddForeignKey
ALTER TABLE "CategoryLevelHistory" ADD CONSTRAINT "CategoryLevelHistory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
