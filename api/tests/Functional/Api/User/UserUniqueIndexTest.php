<?php

namespace App\Tests\Functional\Api\User;

use App\Factory\UserFactory;
use App\Repository\UserRepository;
use App\Tests\Functional\Api\AbstractTestCase;

/**
 * Verifies the case-insensitive duplicate detection layer.
 *
 * Note: the case-insensitive DB unique index (created in
 * Version20260428000000.php via raw SQL) is not present in tests because
 * Foundry recreates the schema from Doctrine metadata, not from migrations.
 * The application-level check via UserRepository::findOneByLowerName therefore
 * acts as the primary gate and is what we exercise here. The DB index remains
 * a defense-in-depth in production.
 */
final class UserUniqueIndexTest extends AbstractTestCase
{
    private function repo(): UserRepository
    {
        return static::getContainer()->get(UserRepository::class);
    }

    public function testFindsExistingUserCaseInsensitively(): void
    {
        UserFactory::createOne(['firstName' => 'Pierre', 'lastName' => 'Martin']);

        $this->assertNotNull($this->repo()->findOneByLowerName('Pierre', 'Martin'));
        $this->assertNotNull($this->repo()->findOneByLowerName('PIERRE', 'martin'));
        $this->assertNotNull($this->repo()->findOneByLowerName('  pierre  ', 'MARTIN'));
    }

    public function testReturnsNullWhenUserDoesNotExist(): void
    {
        UserFactory::createOne(['firstName' => 'Pierre', 'lastName' => 'Martin']);

        $this->assertNull($this->repo()->findOneByLowerName('Jean', 'Dupont'));
        $this->assertNull($this->repo()->findOneByLowerName('Pierre', 'Dupont'));
    }
}
