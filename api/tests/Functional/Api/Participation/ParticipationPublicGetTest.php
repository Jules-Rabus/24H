<?php

namespace App\Tests\Functional\Api\Participation;

use App\ApiResource\Participation\ParticipationApi;
use App\Factory\ParticipationFactory;
use App\Factory\RunFactory;
use App\Tests\Functional\Api\AbstractTestCase;

/**
 * Covers GET /public/participations — anonymous read-only endpoint scoped by
 * `run.edition` via EditionParameterProvider. Used by the public race-status
 * pages to render the leaderboard / chart without admin auth.
 */
final class ParticipationPublicGetTest extends AbstractTestCase
{
    private const string ROUTE = '/public/participations';

    public function testGetCollectionIsAnonymous(): void
    {
        $run = RunFactory::createOne([
            'startDate' => new \DateTimeImmutable('2026-05-10 08:00:00'),
            'endDate' => new \DateTimeImmutable('2026-05-10 08:30:00'),
        ]);
        ParticipationFactory::createMany(3, ['run' => $run]);

        $response = static::createClient()->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertCount(3, $response->toArray());
        $this->assertMatchesResourceCollectionJsonSchema(ParticipationApi::class);
    }

    public function testEditionFilterScopesParticipations(): void
    {
        $run2026 = RunFactory::createOne([
            'startDate' => new \DateTimeImmutable('2026-05-10 08:00:00'),
            'endDate' => new \DateTimeImmutable('2026-05-10 08:30:00'),
        ]);
        $run2025 = RunFactory::createOne([
            'startDate' => new \DateTimeImmutable('2025-05-10 08:00:00'),
            'endDate' => new \DateTimeImmutable('2025-05-10 08:30:00'),
        ]);
        ParticipationFactory::createMany(2, ['run' => $run2026]);
        ParticipationFactory::createMany(3, ['run' => $run2025]);

        $response = static::createClient()->request('GET', self::ROUTE.'?edition=2026', [
            'headers' => ['Accept' => 'application/json'],
        ]);
        $this->assertResponseIsSuccessful();
        $this->assertCount(2, $response->toArray());
        $this->assertMatchesResourceCollectionJsonSchema(ParticipationApi::class);

        $response = static::createClient()->request('GET', self::ROUTE.'?edition=2025', [
            'headers' => ['Accept' => 'application/json'],
        ]);
        $this->assertResponseIsSuccessful();
        $this->assertCount(3, $response->toArray());
    }

    public function testStatusExposedInPayload(): void
    {
        $run = RunFactory::createOne([
            'startDate' => new \DateTimeImmutable('2026-05-10 08:00:00'),
            'endDate' => new \DateTimeImmutable('2026-05-10 08:30:00'),
        ]);
        // FINISHED (arrivalTime set)
        ParticipationFactory::createMany(2, [
            'run' => $run,
            'arrivalTime' => new \DateTime('2026-05-10 08:15:00'),
        ]);
        // IN_PROGRESS
        ParticipationFactory::createOne(['run' => $run, 'arrivalTime' => null]);

        $response = static::createClient()->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/json'],
        ]);
        $this->assertResponseIsSuccessful();
        $data = $response->toArray();
        $this->assertCount(3, $data);

        // Verify status field is present and correct for each participation
        $statuses = array_column($data, 'status');
        $this->assertContains('FINISHED', $statuses);
        $this->assertContains('IN_PROGRESS', $statuses);
        $finishedCount = count(array_filter($statuses, fn ($s) => 'FINISHED' === $s));
        $this->assertSame(2, $finishedCount);
    }

    public function testCollectionShapeExposesPublicFieldsOnly(): void
    {
        $run = RunFactory::createOne();
        ParticipationFactory::createOne(['run' => $run]);

        $response = static::createClient()->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/json'],
        ]);
        $data = $response->toArray();
        // User embedded — must expose firstName/lastName but not email/roles.
        $user = $data[0]['user'] ?? [];
        $this->assertArrayHasKey('id', $user);
        $this->assertArrayHasKey('firstName', $user);
        $this->assertArrayHasKey('lastName', $user);
        $this->assertArrayNotHasKey('email', $user);
        $this->assertArrayNotHasKey('roles', $user);
        $this->assertArrayNotHasKey('password', $user);
    }

    public function testGetCollectionReturnsPublicCacheHeaders(): void
    {
        ParticipationFactory::createOne();

        $response = static::createClient()->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
        $cacheControl = $response->getHeaders()['cache-control'][0] ?? '';
        $this->assertStringContainsString('public', $cacheControl);
        $this->assertStringContainsString('max-age=15', $cacheControl);
    }
}
