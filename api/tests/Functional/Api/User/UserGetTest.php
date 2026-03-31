<?php

namespace App\Tests\Functional\Api\User;

use App\ApiResource\User\UserApi;
use App\Factory\MediasFactory;
use App\Factory\ParticipationFactory;
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
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/json; charset=utf-8');
        $this->assertCount(30, $response->toArray());
        $this->assertMatchesResourceCollectionJsonSchema(UserApi::class);
    }

    public function testGetCollectionForbiddenForUser(): void
    {
        $user = UserFactory::createOne();

        $this->createClientWithCredentials($user)->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testGetUserAsAdmin(): void
    {
        $user = UserFactory::createOne();
        $iri = '/users/'.$user->getId();

        $this->createClientWithCredentials()->request('GET', $iri, [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
        ]);
        $this->assertMatchesResourceItemJsonSchema(UserApi::class);
    }

    public function testGetUserAsOwner(): void
    {
        $user = UserFactory::createOne();
        $iri = '/users/'.$user->getId();

        $this->createClientWithCredentials($user)->request('GET', $iri, [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
        ]);
        $this->assertMatchesResourceItemJsonSchema(UserApi::class);
    }

    public function testGetUserWithImageReturnsUrl(): void
    {
        $media = MediasFactory::createOne(['runner' => null]);
        $user = UserFactory::createOne(['image' => $media]);

        $response = $this->createClientWithCredentials()->request('GET', '/users/'.$user->getId(), [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
        $data = $response->toArray();
        $this->assertArrayHasKey('image', $data);
        $this->assertIsString($data['image']);
    }

    public function testGetUserWithParticipationsReturnsIds(): void
    {
        $user = UserFactory::createOne();
        $participation = ParticipationFactory::createOne(['user' => $user]);

        $response = $this->createClientWithCredentials()->request('GET', '/users/'.$user->getId(), [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
        $data = $response->toArray();
        $this->assertArrayHasKey('participations', $data);
        $this->assertIsArray($data['participations']);
        $this->assertContains($participation->getId(), $data['participations']);
    }

    public function testGetUserForbiddenForWrongUser(): void
    {
        $user = UserFactory::createOne();
        $wrongUser = UserFactory::createOne();

        $this->createClientWithCredentials($wrongUser)->request('GET', '/users/'.$user->getId());

        $this->assertResponseStatusCodeSame(403);
    }
}
