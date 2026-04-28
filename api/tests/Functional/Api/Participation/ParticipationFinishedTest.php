<?php

namespace App\Tests\Functional\Api\Participation;

use App\ApiResource\Participation\ParticipationApi;
use App\Factory\ParticipationFactory;
use App\Factory\RunFactory;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;

final class ParticipationFinishedTest extends AbstractTestCase
{
    private const string ROUTE = '/participations/finished';

    public function testFinishParticipation(): void
    {
        $run = RunFactory::createOne([
            'startDate' => new \DateTime('-1 hour'),
            'endDate' => new \DateTime('+1 hour'),
        ]);
        $user = UserFactory::createOne();
        $participation = ParticipationFactory::createOne([
            'run' => $run,
            'user' => $user,
            'arrivalTime' => null,
        ]);

        $response = $this->createClientWithCredentials()->request('POST', self::ROUTE, [
            'headers' => ['Content-Type' => 'application/json'],
            'json' => [
                'rawValue' => json_encode(['originId' => (string) $user->getId()]),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'id' => $participation->getId(),
            'status' => 'FINISHED',
        ]);
        $this->assertNotNull($response->toArray()['arrivalTime']);
        $this->assertMatchesResourceItemJsonSchema(ParticipationApi::class);
    }

    public function testFinishParticipationNotFound(): void
    {
        $response = $this->createClientWithCredentials()->request('POST', self::ROUTE, [
            'headers' => ['Content-Type' => 'application/json'],
            'json' => [
                'rawValue' => json_encode(['originId' => '9999']),
            ],
        ]);

        $this->assertResponseStatusCodeSame(404);
    }

    public function testFinishParticipationNoActiveRun(): void
    {
        $run = RunFactory::createOne([
            'startDate' => new \DateTime('-2 hours'),
            'endDate' => new \DateTime('-1 hour'),
        ]);
        $user = UserFactory::createOne();
        ParticipationFactory::createOne([
            'run' => $run,
            'user' => $user,
            'arrivalTime' => null,
        ]);

        $this->createClientWithCredentials()->request('POST', self::ROUTE, [
            'headers' => ['Content-Type' => 'application/json'],
            'json' => [
                'rawValue' => json_encode(['originId' => (string) $user->getId()]),
            ],
        ]);

        $this->assertResponseStatusCodeSame(400);
    }

    public function testScansArrivalForCurrentEditionWhenUserHasMultipleParticipations(): void
    {
        $pastRun = RunFactory::createOne([
            'startDate' => new \DateTime('-2 days'),
            'endDate' => new \DateTime('-1 day'),
        ]);
        $currentRun = RunFactory::createOne([
            'startDate' => new \DateTime('-1 hour'),
            'endDate' => new \DateTime('+1 hour'),
        ]);
        $user = UserFactory::createOne();
        ParticipationFactory::createOne([
            'run' => $pastRun,
            'user' => $user,
            'arrivalTime' => new \DateTime('-1 day -30 minutes'),
        ]);
        $currentParticipation = ParticipationFactory::createOne([
            'run' => $currentRun,
            'user' => $user,
            'arrivalTime' => null,
        ]);

        $this->createClientWithCredentials()->request('POST', self::ROUTE, [
            'headers' => ['Content-Type' => 'application/json'],
            'json' => [
                'rawValue' => json_encode(['originId' => (string) $user->getId()]),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'id' => $currentParticipation->getId(),
            'status' => 'FINISHED',
        ]);
    }
}
