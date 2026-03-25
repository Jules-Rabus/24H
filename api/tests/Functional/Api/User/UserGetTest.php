<?php

namespace App\Tests\Functional\Api\User;

use App\Api\User\Resource\User;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;

final class UserGetTest extends AbstractTestCase
{
    private const string ROUTE = '/users';

    public function testGetCollectionAsAdmin(): void
    {
        $client = $this->createClientWithCredentials();
        UserFactory::createMany(29);

        $response = $client->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/ld+json'],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');
        $this->assertJsonContains([
            '@context' => '/contexts/User',
            '@id' => '/users',
            '@type' => 'Collection',
            'totalItems' => 30,
        ]);
        $this->assertCount(30, $response->toArray()['member']);
        $this->assertMatchesResourceCollectionJsonSchema(User::class);
    }

    public function testGetCollectionForbiddenForUser(): void
    {
        $user = UserFactory::createOne();

        $this->createClientWithCredentials($user)->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/ld+json'],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testGetUserAsAdmin(): void
    {
        $user = UserFactory::createOne();
        $iri = '/users/'.$user->getId();

        $this->createClientWithCredentials()->request('GET', $iri, [
            'headers' => ['Accept' => 'application/ld+json'],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/contexts/User',
            '@id' => $iri,
            '@type' => 'User',
            'email' => $user->getEmail(),
        ]);
        $this->assertMatchesResourceItemJsonSchema(User::class);
    }

    public function testGetUserAsOwner(): void
    {
        $user = UserFactory::createOne();
        $iri = '/users/'.$user->getId();

        $this->createClientWithCredentials($user)->request('GET', $iri, [
            'headers' => ['Accept' => 'application/ld+json'],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/contexts/User',
            '@id' => $iri,
            '@type' => 'User',
            'email' => $user->getEmail(),
        ]);
        $this->assertMatchesResourceItemJsonSchema(User::class);
    }

    public function testGetUserForbiddenForWrongUser(): void
    {
        $user = UserFactory::createOne();
        $wrongUser = UserFactory::createOne();

        $this->createClientWithCredentials($wrongUser)->request('GET', '/users/'.$user->getId());

        $this->assertResponseStatusCodeSame(403);
    }
}
