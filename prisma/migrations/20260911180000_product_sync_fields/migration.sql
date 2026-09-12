-- AlterTable
ALTER TABLE `Product`
  ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `sourceUrl` VARCHAR(191) NULL,
  ADD COLUMN `sourceStatus` VARCHAR(191) NULL,
  ADD COLUMN `lastSyncedAt` DATETIME(3) NULL,
  ADD COLUMN `discontinuedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Product_isActive_idx` ON `Product`(`isActive`);
CREATE INDEX `Product_sourceStatus_idx` ON `Product`(`sourceStatus`);
CREATE INDEX `Product_lastSyncedAt_idx` ON `Product`(`lastSyncedAt`);

-- CreateTable
CREATE TABLE `PriceHistory` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `oldPrice` DOUBLE NULL,
    `newPrice` DOUBLE NULL,
    `oldDiscountedPrice` DOUBLE NULL,
    `newDiscountedPrice` DOUBLE NULL,
    `sourceStatus` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PriceHistory_productId_idx`(`productId`),
    INDEX `PriceHistory_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PriceHistory` ADD CONSTRAINT `PriceHistory_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
