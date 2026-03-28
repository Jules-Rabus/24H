<?php

namespace App\Tests\Functional\Api\Participation;

use App\ApiResource\Participation\ParticipationApi;
use App\Factory\RunFactory;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;

final class ParticipationCreateTest extends AbstractTestCase
{
    private const string ROUTE = '/participations';

    public function testCreateParticipationAsAdmin(): void
    {
        $run = RunFactory::createOne();
        $user = UserFactory::createOne();

        $response = $this->createClientWithCredentials()->request('POST', self::ROUTE, [
            'headers' => ['Content-Type' => 'application/json'],
            'json' => [
                'run' => '/runs/'.$run->getId(),
                'user' => '/users/'.$user->getId(),
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);

        // On vérifie que les objets RunRef et UserRef sont bien retournés
        $this->assertJsonContains([
            'run' => ['id' => $run->getId()],
            'user' => ['id' => $user->getId()],
            'status' => 'IN_PROGRESS',
        ]);
        $this->assertMatchesResourceItemJsonSchema(ParticipationApi::class);
    }

    public function testCreateParticipationForbiddenForUser(): void
    {
        $user = UserFactory::createOne();
        $run = RunFactory::createOne();

        $this->createClientWithCredentials($user)->request('POST', self::ROUTE, [
            'headers' => ['Content-Type' => 'application/json'],
            'json' => [
                'run' => '/runs/'.$run->getId(),
                'user' => '/users/'.$user->getId(),
            ],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }
}
