<?php

namespace App\Tests\Functional\Api\Run;

use App\ApiResource\Run\RunApi;
use App\Factory\RunFactory;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;

final class RunUpdateTest extends AbstractTestCase
{
    private const string ROUTE = '/runs';

    public function testUpdateRunAsAdmin(): void
    {
        $startDate = new \DateTimeImmutable('+1 day');
        $run = RunFactory::createOne([
            'startDate' => $startDate,
            'endDate' => $startDate->modify('+1 day'),
        ]);
        $newEndDate = $startDate->modify('+2 days')->format(\DateTimeInterface::RFC3339);

        $this->createClientWithCredentials()->request('PATCH', self::ROUTE.'/'.$run->getId(), [
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'application/merge-patch+json',
            ],
            'json' => ['endDate' => $newEndDate],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['endDate' => $newEndDate]);
        $this->assertMatchesResourceItemJsonSchema(RunApi::class);
    }

    public function testUpdateRunForbiddenForUser(): void
    {
        $run = RunFactory::createOne();
        $user = UserFactory::createOne();

        $this->createClientWithCredentials($user)->request('PATCH', self::ROUTE.'/'.$run->getId(), [
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'application/merge-patch+json',
            ],
            'json' => ['endDate' => (new \DateTimeImmutable('+3 days'))->format(\DateTimeInterface::RFC3339)],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }
}
