<?php

namespace App\Tests\Functional\Api\User;

use App\ApiResource\User\UserApi;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;

final class UserCreateTest extends AbstractTestCase
{
    private const string ROUTE = '/users';

    public function testCreateUserAsAdmin(): void
    {
        $userData = UserFactory::new()->withoutPersisting()->create();

        $response = $this->createClientWithCredentials()->request('POST', self::ROUTE, [
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'email' => $userData->getEmail(),
                'plainPassword' => 'ValidPass123!',
                'firstName' => $userData->getFirstName(),
                'lastName' => $userData->getLastName(),
                'roles' => [],
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertResponseHeaderSame('content-type', 'application/json; charset=utf-8');
        $this->assertJsonContains([
            'email' => $userData->getEmail(),
        ]);
        $this->assertIsInt($response->toArray()['id']);
        $this->assertMatchesResourceItemJsonSchema(UserApi::class);
    }

    public function testCreateUserForbiddenForUser(): void
    {
        $user = UserFactory::createOne();

        $this->createClientWithCredentials($user)->request('POST', self::ROUTE, [
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ],
            'json' => ['email' => 'new@example.com', 'plainPassword' => 'pass'],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testCreateUserWithInvalidEmail(): void
    {
        $this->createClientWithCredentials()->request('POST', self::ROUTE, [
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'email' => 'not_a_valid_email',
                'plainPassword' => 'ValidPass123!',
                'firstName' => 'Test',
                'lastName' => 'User',
                'roles' => [],
            ],
        ]);

        $this->assertResponseStatusCodeSame(422);
        $this->assertJsonContains([
            'violations' => [
                ['propertyPath' => 'email'],
            ],
        ]);
    }
}
