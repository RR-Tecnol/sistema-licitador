-- CreateTable
CREATE TABLE `Licitacao` (
    `id` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NULL,
    `orgao` VARCHAR(191) NOT NULL,
    `endereco` VARCHAR(191) NULL,
    `cidade` VARCHAR(191) NOT NULL,
    `estado` CHAR(2) NOT NULL,
    `cep` VARCHAR(9) NULL,
    `edital` VARCHAR(191) NOT NULL,
    `processo` VARCHAR(191) NULL,
    `valorEstimado` DECIMAL(15, 2) NULL,
    `itens` LONGTEXT NULL,
    `situacao` ENUM('URGENTE', 'NOVA', 'ADIADA', 'PRORROGADA', 'ALTERADA', 'REVOGADA', 'EDITAL') NOT NULL,
    `dataDocumento` DATETIME(3) NULL,
    `dataAbertura` DATETIME(3) NULL,
    `dataPrazo` DATETIME(3) NULL,
    `objeto` TEXT NOT NULL,
    `observacao` LONGTEXT NULL,
    `editalUrl` VARCHAR(191) NULL,
    `atualizadaEm` DATETIME(3) NOT NULL,

    INDEX `Licitacao_situacao_idx`(`situacao`),
    INDEX `Licitacao_estado_idx`(`estado`),
    INDEX `Licitacao_dataPrazo_idx`(`dataPrazo`),
    INDEX `Licitacao_atualizadaEm_idx`(`atualizadaEm`),
    INDEX `Licitacao_valorEstimado_idx`(`valorEstimado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Acompanhamento` (
    `id` VARCHAR(191) NOT NULL,
    `licitacaoId` VARCHAR(191) NOT NULL,
    `orgao` VARCHAR(191) NOT NULL,
    `cidade` VARCHAR(191) NOT NULL,
    `estado` CHAR(2) NOT NULL,
    `edital` VARCHAR(191) NOT NULL,
    `processo` VARCHAR(191) NULL,
    `dataFonte` DATETIME(3) NOT NULL,
    `objeto` TEXT NOT NULL,
    `sintese` LONGTEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Interesse` (
    `licitacaoId` VARCHAR(191) NOT NULL,
    `marcadoEm` DATETIME(3) NOT NULL,
    `decisao` ENUM('participando', 'declinado') NOT NULL,

    PRIMARY KEY (`licitacaoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Acompanhamento` ADD CONSTRAINT `Acompanhamento_licitacaoId_fkey` FOREIGN KEY (`licitacaoId`) REFERENCES `Licitacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Interesse` ADD CONSTRAINT `Interesse_licitacaoId_fkey` FOREIGN KEY (`licitacaoId`) REFERENCES `Licitacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
