<?php

namespace App\Tests\Functional\Api\User;

use App\Api\User\Resource\User;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;

final class UserUpdateTest extends AbstractTestCase
{
    private const string ROUTE = '/users';

    public function testUpdateUserAsAdmin(): void
    {
        $user = UserFactory::createOne();
        $newEmail = 'updated_'.uniqid().'@example.com';

        $this->createClientWithCredentials()->request('PATCH', self::ROUTE.'/'.$user->getId(), [
            'headers' => [
                'Accept' => 'application/ld+json',
                'Content-Type' => 'application/merge-patch+json',
            ],
            'json' => ['email' => $newEmail],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@type' => 'User',
            'email' => $newEmail,
        ]);
        $this->assertMatchesResourceItemJsonSchema(User::class);
    }

    public function testUpdateUserForbiddenForOwner(): void
    {
        $user = UserFactory::createOne();

        $this->createClientWithCredentials($user)->request('PATCH', self::ROUTE.'/'.$user->getId(), [
            'headers' => [
                'Accept' => 'application/ld+json',
                'Content-Type' => 'application/merge-patch+json',
            ],
            'json' => ['email' => 'new@example.com'],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testUpdateUserForbiddenForWrongUser(): void
    {
        $user = UserFactory::createOne();
        $wrongUser = UserFactory::createOne();

        $this->createClientWithCredentials($wrongUser)->request('PATCH', self::ROUTE.'/'.$user->getId(), [
            'headers' => [
                'Accept' => 'application/ld+json',
                'Content-Type' => 'application/merge-patch+json',
            ],
            'json' => ['email' => 'new@example.com'],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }
}
