<?php

namespace App\Tests\Functional\Api\User;

use App\Factory\UserFactory;
use App\Repository\UserRepository;
use App\Tests\Functional\Api\AbstractTestCase;

/**
 * Covers UserRepository::findOneByLowerName (case-insensitive lookup).
 */
final class UserRepositoryTest extends AbstractTestCase
{
    private function repo(): UserRepository
    {
        return static::getContainer()->get(UserRepository::class);
    }

    public function testFindOneByLowerNameExactMatch(): void
    {
        UserFactory::createOne(['firstName' => 'Jean', 'lastName' => 'Dupont']);

        $result = $this->repo()->findOneByLowerName('Jean', 'Dupont');

        $this->assertNotNull($result);
        $this->assertSame('Jean', $result->getFirstName());
    }

    public function testFindOneByLowerNameCaseInsensitive(): void
    {
        UserFactory::createOne(['firstName' => 'Jean', 'lastName' => 'Dupont']);

        $result = $this->repo()->findOneByLowerName('jean', 'DUPONT');

        $this->assertNotNull($result);
    }

    public function testFindOneByLowerNameNotFound(): void
    {
        UserFactory::createOne(['firstName' => 'Jean', 'lastName' => 'Dupont']);

        $result = $this->repo()->findOneByLowerName('Pierre', 'Martin');

        $this->assertNull($result);
    }

    public function testFindOneByLowerNameTrimsSpaces(): void
    {
        UserFactory::createOne(['firstName' => 'Jean', 'lastName' => 'Dupont']);

        $result = $this->repo()->findOneByLowerName('  jean  ', '  dupont  ');

        $this->assertNotNull($result);
    }
}
