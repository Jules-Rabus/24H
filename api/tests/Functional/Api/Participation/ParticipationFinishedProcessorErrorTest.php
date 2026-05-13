<?php

namespace App\Tests\Functional\Api\Participation;

use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;

/**
 * Covers the error paths in ParticipationFinishedProcessor that are not
 * covered by the main ParticipationFinishedTest.
 */
final class ParticipationFinishedProcessorErrorTest extends AbstractTestCase
{
    private const string ROUTE = '/participations/finished';

    public function testMissingOriginIdReturnsBadRequest(): void
    {
        $this->createClientWithCredentials()->request('POST', self::ROUTE, [
            'headers' => ['Content-Type' => 'application/json'],
            'json' => [
                'rawValue' => json_encode(['userId' => '1']), // 'originId' key is missing
            ],
        ]);

        $this->assertResponseStatusCodeSame(400);
    }

    public function testUserNotFoundReturns404(): void
    {
        $this->createClientWithCredentials()->request('POST', self::ROUTE, [
            'headers' => ['Content-Type' => 'application/json'],
            'json' => [
                'rawValue' => json_encode(['originId' => '999999']),
            ],
        ]);

        $this->assertResponseStatusCodeSame(404);
    }

    public function testUserWithNoActiveRunReturnsBadRequest(): void
    {
        // User exists but has no in-progress run
        $user = UserFactory::createOne();

        $this->createClientWithCredentials()->request('POST', self::ROUTE, [
            'headers' => ['Content-Type' => 'application/json'],
            'json' => [
                'rawValue' => json_encode(['originId' => (string) $user->getId()]),
            ],
        ]);

        $this->assertResponseStatusCodeSame(400);
    }
}
