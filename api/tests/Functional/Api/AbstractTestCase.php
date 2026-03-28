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

    private const string DEFAULT_PASSWORD = '$3cr3t';
    private ?string $token = null;

    protected static ?bool $alwaysBootKernel = true;

    protected function setUp(): void
    {
        parent::setUp();
        $this->_beforeHook();
        UserFactory::createOne([
            'email' => 'admin@example.com',
            'password' => self::DEFAULT_PASSWORD,
            'roles' => ['ROLE_ADMIN'],
        ]);
    }

    protected function tearDown(): void
    {
        self::_afterHook();
        parent::tearDown();
    }

    protected function createClientWithCredentials(string|User|null $token = null): Client
    {
        if ($token instanceof User) {
            $token = $this->getToken([
                'email' => $token->getEmail(),
                'password' => self::DEFAULT_PASSWORD,
            ]);
        }

        $token ??= $this->getToken();

        return static::createClient([], [
            'headers' => [
                'Authorization' => 'Bearer '.$token,
                'Accept' => 'application/json',
            ],
        ]);
    }

    /**
     * @param array<string, string> $body
     */
    protected function getToken(array $body = []): string
    {
        if ([] === $body && null !== $this->token) {
            return $this->token;
        }

        $response = static::createClient()->request('POST', '/login', [
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ],
            'json' => $body ?: [
                'email' => 'admin@example.com',
                'password' => self::DEFAULT_PASSWORD,
            ],
        ]);

        $this->assertResponseIsSuccessful();

        $data = $response->toArray(false);
        $token = $data['token'] ?? throw new \RuntimeException('JWT token missing from /login response.');

        if ([] === $body) {
            $this->token = $token;
        }

        return $token;
    }
}
