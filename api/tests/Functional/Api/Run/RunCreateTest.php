<?php

namespace App\Tests\Functional\Api\Run;

use App\Api\Run\Resource\Run;
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
                'Content-Type' => 'application/ld+json',
                'Accept' => 'application/ld+json',
            ],
            'json' => [
                'startDate' => $startDate->format(\DateTimeInterface::RFC3339),
                'endDate' => $endDate->format(\DateTimeInterface::RFC3339),
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            '@type' => 'Run',
            'startDate' => $startDate->format(\DateTimeInterface::RFC3339),
        ]);
        $this->assertMatchesRegularExpression('~^/runs/\d+$~', $response->toArray()['@id']);
        $this->assertMatchesResourceItemJsonSchema(Run::class);
    }

    public function testCreateRunForbiddenForUser(): void
    {
        $user = UserFactory::createOne();
        $startDate = new \DateTimeImmutable('+1 day');
        $endDate = $startDate->modify('+1 day');

        $this->createClientWithCredentials($user)->request('POST', self::ROUTE, [
            'headers' => [
                'Content-Type' => 'application/ld+json',
                'Accept' => 'application/ld+json',
            ],
            'json' => [
                'startDate' => $startDate->format(\DateTimeInterface::RFC3339),
                'endDate' => $endDate->format(\DateTimeInterface::RFC3339),
            ],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }
}
