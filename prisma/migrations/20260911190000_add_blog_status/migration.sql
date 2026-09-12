-- AlterTable
ALTER TABLE `Blog`
  ADD COLUMN `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN `publishedAt` DATETIME(3) NULL;

-- Existing posts were already public before drafts existed.
UPDATE `Blog`
SET `status` = 'PUBLISHED',
    `publishedAt` = `createdAt`;

-- CreateIndex
CREATE INDEX `Blog_status_idx` ON `Blog`(`status`);
CREATE INDEX `Blog_publishedAt_idx` ON `Blog`(`publishedAt`);
