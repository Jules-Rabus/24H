<?php

namespace App\Tests\Functional\Api\Run;

use App\ApiResource\Run\RunApi;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;

final class RunCreateTest extends AbstractTestCase
{
    private const string ROUTE = '/runs';

    public function testCreateRunAsAdmin(): void
    {
        $startDate = new \DateTimeImmutable('+1 day');
        $endDate = $startDate->modify('+1 day');

        $response = $this->createClientWithCredentials()->request('POST', self::ROUTE, [
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
            'json' => [
                'startDate' => $startDate->format(\DateTimeInterface::RFC3339),
                'endDate' => $endDate->format(\DateTimeInterface::RFC3339),
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            'startDate' => $startDate->format(\DateTimeInterface::RFC3339),
        ]);
        $this->assertIsInt($response->toArray()['id']);
        $this->assertMatchesResourceItemJsonSchema(RunApi::class);
    }

    public function testCreateRunForbiddenForUser(): void
    {
        $user = UserFactory::createOne();
        $startDate = new \DateTimeImmutable('+1 day');
        $endDate = $startDate->modify('+1 day');

        $this->createClientWithCredentials($user)->request('POST', self::ROUTE, [
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
            'json' => [
                'startDate' => $startDate->format(\DateTimeInterface::RFC3339),
                'endDate' => $endDate->format(\DateTimeInterface::RFC3339),
            ],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }
}
