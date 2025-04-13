/*
  Warnings:

  - The `category` column on the `Module` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `difficulty` column on the `Module` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ModuleCategory" AS ENUM ('GENERAL', 'SAVINGS', 'INVESTING', 'BUDGETING', 'ENTREPRENEURSHIP');

-- CreateEnum
CREATE TYPE "ModuleDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- AlterTable
ALTER TABLE "Module" DROP COLUMN "category",
ADD COLUMN     "category" "ModuleCategory" NOT NULL DEFAULT 'GENERAL',
DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "ModuleDifficulty" NOT NULL DEFAULT 'BEGINNER';
