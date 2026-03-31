<?php

namespace App\Tests\Functional\Api\Participation;

use App\ApiResource\Participation\ParticipationApi;
use App\Factory\ParticipationFactory;
use App\Factory\RunFactory;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;

final class ParticipationUpdateTest extends AbstractTestCase
{
    private const string ROUTE = '/participations';

    public function testUpdateParticipationAsAdmin(): void
    {
        $startDate = new \DateTimeImmutable('-2 days');
        $participation = ParticipationFactory::createOne([
            'run' => RunFactory::new(['startDate' => $startDate, 'endDate' => $startDate->modify('+1 day')]),
        ]);
        $arrivalTime = $startDate->modify('+1 hour')->format(\DateTimeInterface::RFC3339);

        $this->createClientWithCredentials()->request('PATCH', self::ROUTE.'/'.$participation->getId(), [
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'application/merge-patch+json',
            ],
            'json' => ['arrivalTime' => $arrivalTime],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['arrivalTime' => $arrivalTime]);
        $this->assertMatchesResourceItemJsonSchema(ParticipationApi::class);
    }

    public function testUpdateParticipationForbiddenForUser(): void
    {
        $participation = ParticipationFactory::createOne();
        $user = UserFactory::createOne();

        $this->createClientWithCredentials($user)->request('PATCH', self::ROUTE.'/'.$participation->getId(), [
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'application/merge-patch+json',
            ],
            'json' => ['arrivalTime' => (new \DateTimeImmutable())->format(\DateTimeInterface::RFC3339)],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }
}
