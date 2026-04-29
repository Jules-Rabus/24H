<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Aligns the participation.run_id FK with the ORM mapping (cascade remove)
 * by adding ON DELETE CASCADE at the SQL level.
 */
final class Version20260429210000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add ON DELETE CASCADE to participation.run_id FK so deleting a Run cascades to its participations';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE participation DROP CONSTRAINT FK_AB55E24F84E3FEC4');
        $this->addSql(
            'ALTER TABLE participation
                ADD CONSTRAINT FK_AB55E24F84E3FEC4
                FOREIGN KEY (run_id) REFERENCES run (id)
                ON DELETE CASCADE
                NOT DEFERRABLE INITIALLY IMMEDIATE'
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE participation DROP CONSTRAINT FK_AB55E24F84E3FEC4');
        $this->addSql(
            'ALTER TABLE participation
                ADD CONSTRAINT FK_AB55E24F84E3FEC4
                FOREIGN KEY (run_id) REFERENCES run (id)
                NOT DEFERRABLE INITIALLY IMMEDIATE'
        );
    }
}
