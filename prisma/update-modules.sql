-- Update all existing modules to be visible in marketplace
UPDATE "Module" SET "isMarketplace" = true WHERE "isPublished" = true; 