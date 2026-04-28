<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\Migrations\Exception\AbortMigration;

final class Version20260428000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Insert Run 2026 and add case-insensitive unique index on user (firstName, lastName)';
    }

    public function up(Schema $schema): void
    {
        $duplicates = $this->connection->fetchAllAssociative(
            'SELECT LOWER(first_name) AS fn, LOWER(last_name) AS ln, COUNT(*) AS c
             FROM "user"
             GROUP BY LOWER(first_name), LOWER(last_name)
             HAVING COUNT(*) > 1'
        );
        if ([] !== $duplicates) {
            $list = array_map(static fn (array $r) => sprintf('%s %s (%d)', $r['fn'], $r['ln'], $r['c']), $duplicates);
            throw new AbortMigration('Cannot create unique index: existing duplicate users (firstName, lastName) detected: '.implode(', ', $list).'. Please resolve duplicates manually before re-running.');
        }

        $this->addSql('CREATE UNIQUE INDEX uniq_user_firstname_lastname ON "user" (LOWER(first_name), LOWER(last_name))');

        $this->addSql(
            "INSERT INTO run (start_date, end_date, edition, created_at, updated_at)
             SELECT '2026-06-13 10:00:00', '2026-06-14 10:00:00', 2026, NOW(), NOW()
             WHERE NOT EXISTS (SELECT 1 FROM run WHERE edition = 2026)"
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DELETE FROM run WHERE edition = 2026');
        $this->addSql('DROP INDEX IF EXISTS uniq_user_firstname_lastname');
    }
}
