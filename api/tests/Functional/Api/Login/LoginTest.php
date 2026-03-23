<?php

namespace App\Tests\Functional\Api\Login;

use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;

final class LoginTest extends AbstractTestCase
{
    private const string ROUTE = '/login';

    public function testLogin(): void
    {
        $client = static::createClient();
        $user = UserFactory::new()->create(['password' => '$3cr3t']);

        $response = $client->request('POST', self::ROUTE, [
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'email' => $user->getEmail(),
                'password' => '$3cr3t',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        self::assertArrayHasKey('token', $response->toArray(false));
        $this->assertResponseHasCookie('BEARER');
    }

    public function testLoginWithInvalidCredentials(): void
    {
        $client = static::createClient();
        $user = UserFactory::new()->create(['password' => '$3cr3t']);

        $client->request('POST', self::ROUTE, [
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
