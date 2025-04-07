<?php

namespace App\Tests\Functional\Api;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;
use ApiPlatform\Symfony\Bundle\Test\Client;
use App\Entity\User;
use App\Factory\UserFactory;
use Zenstruck\Foundry\Test\Factories;
use Zenstruck\Foundry\Test\ResetDatabase;

abstract class AbstractTestCase extends ApiTestCase
{
    use ResetDatabase;
    use Factories;

    private ?string $token = null;

    protected function setUp(): void
    {
        parent::setUp();
        $this->token = $this->getToken();
    }

    protected function getToken(?User $user = null): string
    {
        $user = $user ?? UserFactory::new()->create(['password' => 'password']);

        $jwtManager = static::getContainer()->get('lexik_jwt_authentication.jwt_manager');

        return $jwtManager->create($user);
    }

    protected function createClientWithCredentials(?User $user = null): Client
    {
        $token = $user ? $this->getToken($user) : $this->token;

        return static::createClient([], ['headers' => ['authorization' => 'Bearer '.$token]]);
    }
}
