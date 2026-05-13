<?php

namespace App\Tests\Functional\Api\Participation;

use App\ApiResource\Participation\ParticipationApi;
use App\Factory\ParticipationFactory;
use App\Factory\RunFactory;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;

/**
 * Covers the SearchFilter properties declared on ParticipationApi for the
 * admin /participations route. Drives each filter the front (useAdminParticipationsQuery)
 * actually sends. Pagination and ordering are framework concerns handled by
 * API Platform itself — not retested here.
 */
final class ParticipationFilterTest extends AbstractTestCase
{
    private const string ROUTE = '/participations';

    public function testFilterByUserId(): void
    {
        $alice = UserFactory::createOne(['firstName' => 'Alice', 'lastName' => 'Alpha']);
        $bob = UserFactory::createOne(['firstName' => 'Bob', 'lastName' => 'Beta']);
        ParticipationFactory::createMany(2, ['user' => $alice]);
        ParticipationFactory::createMany(3, ['user' => $bob]);

        $response = $this->createClientWithCredentials()
            ->request('GET', self::ROUTE.'?user.id='.$alice->getId());

        $this->assertResponseIsSuccessful();
        $this->assertCount(2, $response->toArray());
        $this->assertMatchesResourceCollectionJsonSchema(ParticipationApi::class);
    }

    public function testFilterByRunId(): void
    {
        $r1 = RunFactory::createOne([
            'startDate' => new \DateTimeImmutable('2026-05-10 08:00:00'),
            'endDate' => new \DateTimeImmutable('2026-05-10 08:30:00'),
        ]);
        $r2 = RunFactory::createOne([
            'startDate' => new \DateTimeImmutable('2026-05-10 09:00:00'),
            'endDate' => new \DateTimeImmutable('2026-05-10 09:30:00'),
        ]);
        ParticipationFactory::createMany(4, ['run' => $r1]);
        ParticipationFactory::createMany(2, ['run' => $r2]);

        $response = $this->createClientWithCredentials()
            ->request('GET', self::ROUTE.'?run.id='.$r1->getId());

        $this->assertResponseIsSuccessful();
        $this->assertCount(4, $response->toArray());
        $this->assertMatchesResourceCollectionJsonSchema(ParticipationApi::class);
    }

    public function testFilterByUserFirstNameIstart(): void
    {
        $alice = UserFactory::createOne(['firstName' => 'Alice', 'lastName' => 'Alpha']);
        $alan = UserFactory::createOne(['firstName' => 'Alan', 'lastName' => 'Anders']);
        $bob = UserFactory::createOne(['firstName' => 'Bob', 'lastName' => 'Beta']);
        ParticipationFactory::createOne(['user' => $alice]);
        ParticipationFactory::createOne(['user' => $alan]);
        ParticipationFactory::createOne(['user' => $bob]);

        // istart = case-insensitive prefix match. "al" matches Alice + Alan.
        $response = $this->createClientWithCredentials()
            ->request('GET', self::ROUTE.'?user.firstName=al');

        $this->assertResponseIsSuccessful();
        $data = $response->toArray();
        $this->assertCount(2, $data);
        $firstNames = array_map(static fn ($p) => $p['user']['firstName'] ?? null, $data);
        sort($firstNames);
        $this->assertSame(['Alan', 'Alice'], $firstNames);
        $this->assertMatchesResourceCollectionJsonSchema(ParticipationApi::class);
    }

    public function testFilterByUserLastNameIstart(): void
    {
        $u1 = UserFactory::createOne(['firstName' => 'X', 'lastName' => 'Smith']);
        $u2 = UserFactory::createOne(['firstName' => 'Y', 'lastName' => 'Smithson']);
        $u3 = UserFactory::createOne(['firstName' => 'Z', 'lastName' => 'Jones']);
        ParticipationFactory::createOne(['user' => $u1]);
        ParticipationFactory::createOne(['user' => $u2]);
        ParticipationFactory::createOne(['user' => $u3]);

        $response = $this->createClientWithCredentials()
            ->request('GET', self::ROUTE.'?user.lastName=smi');

        $this->assertResponseIsSuccessful();
        $this->assertCount(2, $response->toArray());
        $this->assertMatchesResourceCollectionJsonSchema(ParticipationApi::class);
    }
}
