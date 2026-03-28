<?php

namespace App\Tests\Functional\Api\Participation;

use App\ApiResource\Participation\ParticipationApi;
use App\Factory\ParticipationFactory;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;

final class ParticipationGetTest extends AbstractTestCase
{
    private const string ROUTE = '/participations';

    public function testGetCollectionAsAdmin(): void
    {
        ParticipationFactory::createMany(3);

        $response = $this->createClientWithCredentials()->request('GET', self::ROUTE);

        $this->assertResponseIsSuccessful();
        $this->assertCount(3, $response->toArray());
        $this->assertMatchesResourceCollectionJsonSchema(ParticipationApi::class);
    }

    public function testGetCollectionForbiddenForUser(): void
    {
        $user = UserFactory::createOne();
        ParticipationFactory::createMany(3);

        $this->createClientWithCredentials($user)->request('GET', self::ROUTE);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testGetParticipationAsAdmin(): void
    {
        $participation = ParticipationFactory::createOne();

        $response = $this->createClientWithCredentials()->request('GET', self::ROUTE.'/'.$participation->getId());

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'id' => $participation->getId(),
        ]);
        $this->assertMatchesResourceItemJsonSchema(ParticipationApi::class);
    }
}
