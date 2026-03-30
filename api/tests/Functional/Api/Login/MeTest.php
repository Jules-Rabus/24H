<?php

namespace App\Tests\Functional\Api\Login;

use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;

final class MeTest extends AbstractTestCase
{
    private const string ROUTE = '/me';

    public function testMeReturnsAuthenticatedUser(): void
    {
        $user = UserFactory::new()->create([
            'email' => 'runner@example.com',
            'password' => '$3cr3t',
            'roles' => ['ROLE_USER'],
        ]);

        $client = $this->createClientWithCredentials($user);

        $response = $client->request('GET', self::ROUTE);

        $this->assertResponseIsSuccessful();
        $data = $response->toArray(false);
        self::assertSame($user->getEmail(), $data['email']);
        self::assertSame($user->getFirstName(), $data['firstName']);
    }

    public function testMeReturns401WhenUnauthenticated(): void
    {
        $client = static::createClient();

        $client->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseStatusCodeSame(401);
    }
}
