<?php

namespace App\Tests\Functional\Api;

use App\Entity\User;
use App\Factory\UserFactory;

final class UserTest extends AbstractTestCase
{
    private const string ROUTE = '/users';

    public function testGetCollectionWithAdmin(): void
    {
        UserFactory::CreateMany(48);

        $user = UserFactory::new()->create(['roles' => ['ROLE_ADMIN']]);

        $response = $this->createClientWithCredentials($user)->request('GET', self::ROUTE,
            [
                'headers' => [
                    'Accept' => 'application/ld+json',
                ],
            ]
        );

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');

        $this->assertJsonContains([
            '@context' => '/contexts/User',
            '@id' => '/users',
            '@type' => 'Collection',
            'totalItems' => 50,
            'view' => [
                '@id' => '/users?page=1',
                '@type' => 'PartialCollectionView',
                'first' => '/users?page=1',
                'last' => '/users?page=2',
                'next' => '/users?page=2',
            ],
        ]);

        $this->assertCount(30, $response->toArray()['member']);

        $this->assertMatchesResourceCollectionJsonSchema(User::class);
    }

    public function testGetCollectionWithUser(): void
    {
        UserFactory::CreateMany(48);

        $user = UserFactory::new()->create();

        $this->createClientWithCredentials($user)->request('GET', self::ROUTE,
            [
                'headers' => [
                    'Accept' => 'application/ld+json',
                ],
            ]
        );

        $this->assertResponseStatusCodeSame(403);
    }

    public function testGetUserWithAdmin(): void
    {
        $user = UserFactory::new()->create(['roles' => ['ROLE_ADMIN']]);

        $iri = $this->findIriBy(User::class, ['id' => $user->getId()]);

        $response = $this->createClientWithCredentials($user)->request('GET', $iri,
            [
                'headers' => [
                    'Accept' => 'application/ld+json',
                ],
            ]
        );

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');

        $this->assertJsonContains([
            '@context' => '/contexts/User',
            '@id' => $iri,
            '@type' => 'User',
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
        ]);

        $this->assertNotContains($user->getPassword(), $response->toArray());

        $this->assertMatchesResourceItemJsonSchema(User::class);
    }

    public function testGetUserWithOwner(): void
    {
        $user = UserFactory::new()->create();

        $iri = $this->findIriBy(User::class, ['id' => $user->getId()]);

        $response = $this->createClientWithCredentials($user)->request('GET', $iri,
            [
                'headers' => [
                    'Accept' => 'application/ld+json',
                ],
            ]
        );

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');

        $this->assertJsonContains([
            '@context' => '/contexts/User',
            '@id' => $iri,
            '@type' => 'User',
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
        ]);

        $this->assertNotContains($user->getPassword(), $response->toArray());

        $this->assertMatchesResourceItemJsonSchema(User::class);
    }

    public function testGetUserWithWrongUser(): void
    {
        $user = UserFactory::new()->create();
        $wrongUser = UserFactory::new()->create();

        $iri = $this->findIriBy(User::class, ['id' => $user->getId()]);

        $this->createClientWithCredentials($wrongUser)->request('GET', $iri);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testCreateUser(): void
    {
        $user = UserFactory::new()->withoutPersisting()->create();

        $response = $this->createClientWithCredentials()->request('POST', self::ROUTE,
            [
                'headers' => [
                    'Accept' => 'application/ld+json',
                    'Content-Type' => 'application/ld+json',
                ],
                'json' => [
                    'email' => $user->getEmail(),
                    'plainPassword' => $user->getPassword(),
                    'roles' => $user->getRoles(),
                ],
            ],
        );

        $this->assertResponseStatusCodeSame(201);
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');
        $this->assertJsonContains([
            '@context' => '/contexts/User',
            '@type' => 'User',
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
        ]);

        $this->assertNotContains($user->getPassword(), $response->toArray());

        $this->assertMatchesRegularExpression('~^/users/\d+$~', $response->toArray()['@id']);
        $this->assertMatchesResourceItemJsonSchema(User::class);
    }

    public function testCreateInvalidUser(): void
    {
        $userInvalid = UserFactory::new()->withoutPersisting()->create(['email' => 'not_a_valid_email']);

        $this->createClientWithCredentials()->request('POST', self::ROUTE,
            [
                'headers' => [
                    'Accept' => 'application/ld+json',
                    'Content-Type' => 'application/ld+json',
                ],
                'json' => [
                    'email' => $userInvalid->getEmail(),
                    'plainPassword' => $userInvalid->getPassword(),
                    'roles' => $userInvalid->getRoles(),
                ],
            ],
        );

        $this->assertResponseStatusCodeSame(422);
        $this->assertResponseHeaderSame('content-type', 'application/problem+json; charset=utf-8');

        $this->assertJsonContains([
            '@context' => '/contexts/ConstraintViolationList',
            '@type' => 'ConstraintViolationList',
            'title' => 'An error occurred',
            'violations' => [
                [
                    'propertyPath' => 'email',
                    'message' => 'This value is not a valid email address.',
                    'code' => 'bd79c0ab-ddba-46cc-a703-a7a4b08de310',
                ],
            ],
            'detail' => 'email: This value is not a valid email address.',
            'description' => 'email: This value is not a valid email address.',
        ]);
    }

    public function testUpdateUserWithAdmin(): void
    {
        $admin = UserFactory::new()->create(['roles' => ['ROLE_ADMIN']]);
        $user = UserFactory::new()->create();
        $newEmail = UserFactory::new()->withoutPersisting()->create()->getEmail();

        $iri = $this->findIriBy(User::class, ['id' => $user->getId()]);

        $response = $this->createClientWithCredentials($admin)->request('PATCH', $iri,
            [
                'headers' => [
                    'Accept' => 'application/ld+json',
                    'Content-Type' => 'application/merge-patch+json',
                ],
                'json' => [
                    'email' => $newEmail,
                ],
            ],
        );

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/contexts/User',
            '@type' => 'User',
            'email' => $newEmail,
            'roles' => $user->getRoles(),
        ]);

        $this->assertNotContains($user->getPassword(), $response->toArray());

        $this->assertMatchesResourceItemJsonSchema(User::class);
    }

    public function testUpdateUserWithOwner(): void
    {
        $user = UserFactory::new()->create();
        $newEmail = UserFactory::new()->withoutPersisting()->create()->getEmail();

        $iri = $this->findIriBy(User::class, ['id' => $user->getId()]);

        $response = $this->createClientWithCredentials($user)->request('PATCH', $iri,
            [
                'headers' => [
                    'Accept' => 'application/ld+json',
                    'Content-Type' => 'application/merge-patch+json',
                ],
                'json' => [
                    'email' => $newEmail,
                ],
            ],
        );

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/contexts/User',
            '@type' => 'User',
            'email' => $newEmail,
            'roles' => $user->getRoles(),
        ]);

        $this->assertNotContains($user->getPassword(), $response->toArray());

        $this->assertMatchesResourceItemJsonSchema(User::class);
    }

    public function testUpdateUserWithWrongUser(): void
    {
        $user = UserFactory::new()->create();
        $newEmail = UserFactory::new()->withoutPersisting()->create()->getEmail();
        $wrongUser = UserFactory::new()->create();

        $iri = $this->findIriBy(User::class, ['id' => $user->getId()]);

        $this->createClientWithCredentials($wrongUser)->request('PATCH', $iri,
            [
                'headers' => [
                    'Accept' => 'application/ld+json',
                    'Content-Type' => 'application/merge-patch+json',
                ],
                'json' => [
                    'email' => $newEmail,
                ],
            ],
        );

        $this->assertResponseStatusCodeSame(403);
    }

    public function testDeleteUserWithAdmin(): void
    {
        $user = UserFactory::new()->create(['roles' => ['ROLE_ADMIN']]);

        $iri = $this->findIriBy(User::class, ['id' => $user->getId()]);

        $this->createClientWithCredentials($user)->request('DELETE', $iri);

        $this->assertResponseStatusCodeSame(204);

        $this->assertNull(
            static::getContainer()->get('doctrine')->getRepository(User::class)->find($user->getId())
        );
    }

    public function testDeleteUserWithOwner(): void
    {
        $user = UserFactory::new()->create();

        $iri = $this->findIriBy(User::class, ['id' => $user->getId()]);

        $this->createClientWithCredentials($user)->request('DELETE', $iri);

        $this->assertResponseStatusCodeSame(204);

        $this->assertNull(
            static::getContainer()->get('doctrine')->getRepository(User::class)->find($user->getId())
        );
    }

    public function testDeleteUserWithWrongUser(): void
    {
        $user = UserFactory::new()->create();
        $wrongUser = UserFactory::new()->create();

        $iri = $this->findIriBy(User::class, ['id' => $user->getId()]);

        $this->createClientWithCredentials($wrongUser)->request('DELETE', $iri);

        $this->assertResponseStatusCodeSame(403);
    }
}
