/*
  Warnings:

  - Added the required column `creatorId` to the `Module` table without a default value. This is not possible if the table is not empty.

*/
-- First, get a parent user ID to assign existing modules to
DO $$
DECLARE
    parent_id TEXT;
BEGIN
    -- Get the first parent user's ID
    SELECT id INTO parent_id FROM "User" WHERE "userType" = 'PARENT' LIMIT 1;

    -- If no parent exists, create one
    IF parent_id IS NULL THEN
        INSERT INTO "User" (id, email, "userType", "createdAt", "updatedAt")
        VALUES (
            'default-parent',
            'default-parent@example.com',
            'PARENT',
            NOW(),
            NOW()
        )
        RETURNING id INTO parent_id;
    END IF;

    -- Add the creatorId column as nullable first
    ALTER TABLE "Module" ADD COLUMN "creatorId" TEXT;

    -- Update existing modules to use the parent_id
    UPDATE "Module" SET "creatorId" = parent_id WHERE "creatorId" IS NULL;

    -- Now make the column required
    ALTER TABLE "Module" ALTER COLUMN "creatorId" SET NOT NULL;

    -- Add the foreign key constraint
    ALTER TABLE "Module" ADD CONSTRAINT "Module_creatorId_fkey" 
        FOREIGN KEY ("creatorId") REFERENCES "User"("id") 
        ON DELETE RESTRICT ON UPDATE CASCADE;
END $$;
