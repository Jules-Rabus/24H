<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260403095946 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add ON DELETE CASCADE on participation.user_id foreign key';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE participation DROP CONSTRAINT fk_ab55e24fa76ed395');
        $this->addSql('ALTER TABLE participation ADD CONSTRAINT FK_AB55E24FA76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE participation DROP CONSTRAINT FK_AB55E24FA76ED395');
        $this->addSql('ALTER TABLE participation ADD CONSTRAINT fk_ab55e24fa76ed395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }
}
