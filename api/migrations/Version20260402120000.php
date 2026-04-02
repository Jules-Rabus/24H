<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260402120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Backfill edition=2025 for all existing runs with no edition set';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('UPDATE run SET edition = 2025 WHERE edition IS NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('UPDATE run SET edition = NULL WHERE edition = 2025');
    }
}
