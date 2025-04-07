<?php

namespace App\Tests\Functional\Api;

use App\Factory\UserFactory;
use Zenstruck\Foundry\Test\Factories;
use Zenstruck\Foundry\Test\ResetDatabase;

final class LoginTest extends AbstractTestCase
{
    use Factories;
    use ResetDatabase;

    private const string ROUTE = '/login';

    public function testLogin(): void
    {
        $user = UserFactory::new()->create(['password' => 'password']);

        $response = static::createClient()->request('POST', self::ROUTE,
            [
                'headers' => [
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'email' => $user->getEmail(),
                    'password' => 'password',
                ],
            ]);

        $response = $response->toArray();
        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/json');
        $this->assertArrayHasKey('token', $response);
    }

    public function testLoginWithInvalidCredentials(): void
    {
        $user = UserFactory::new()->create(['password' => 'password']);

        static::createClient()->request('POST', self::ROUTE,
            [
                'headers' => [
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'email' => $user->getEmail(),
                    'password' => 'invalid',
                ],
            ]);

        $this->assertResponseStatusCodeSame(401);
        $this->assertResponseHeaderSame('content-type', 'application/json');
    }
}
