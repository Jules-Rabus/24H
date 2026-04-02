<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260402000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add edition column to run table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE run ADD COLUMN IF NOT EXISTS edition INT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE run DROP COLUMN IF EXISTS edition');
    }
}
