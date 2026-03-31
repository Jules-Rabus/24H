<?php

namespace App\Tests\Functional\Api\User;

use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;

final class UserPublicTest extends AbstractTestCase
{
    private const string ROUTE = '/users/public';

    public function testGetPublicCollection(): void
    {
        UserFactory::createMany(5);

        $response = static::createClient()->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
        // 5 created + 1 admin from setUp
        $this->assertCount(6, $response->toArray());
    }

    public function testGetPublicUser(): void
    {
        $user = UserFactory::createOne();

        $response = static::createClient()->request('GET', self::ROUTE.'/'.$user->getId(), [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
        $data = $response->toArray();
        $this->assertSame($user->getId(), $data['id']);
        $this->assertSame($user->getFirstName(), $data['firstName']);
    }
}
