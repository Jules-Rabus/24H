<?php

namespace App\Tests\Functional\Api\Run;

use App\Factory\RunFactory;
use App\Tests\Functional\Api\AbstractTestCase;

/**
 * Covers GET /runs/public — anonymous, edition-filterable read-only endpoint
 * used by the public race-status pages (/course, /public-race-status).
 */
final class RunPublicGetTest extends AbstractTestCase
{
    private const string ROUTE = '/runs/public';

    public function testGetCollectionIsAnonymous(): void
    {
        // Use distinct timestamps to avoid unique constraint on startDate
        RunFactory::createOne([
            'startDate' => new \DateTimeImmutable('2026-05-10 08:00:00'),
            'endDate' => new \DateTimeImmutable('2026-05-10 08:30:00'),
        ]);
        RunFactory::createOne([
            'startDate' => new \DateTimeImmutable('2026-05-10 09:00:00'),
            'endDate' => new \DateTimeImmutable('2026-05-10 09:30:00'),
        ]);
        RunFactory::createOne([
            'startDate' => new \DateTimeImmutable('2026-05-10 10:00:00'),
            'endDate' => new \DateTimeImmutable('2026-05-10 10:30:00'),
        ]);

        $response = static::createClient()->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/json; charset=utf-8');
        $this->assertCount(3, $response->toArray());
    }

    public function testGetCollectionExposesEditionField(): void
    {
        RunFactory::createOne([
            'startDate' => new \DateTimeImmutable('2026-05-11 08:00:00'),
            'endDate' => new \DateTimeImmutable('2026-05-11 08:30:00'),
        ]);

        $response = static::createClient()->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/json'],
        ]);
        $data = $response->toArray();

        $this->assertArrayHasKey('edition', $data[0]);
        $this->assertSame(2026, $data[0]['edition']);
    }

    public function testEditionQueryParameterFiltersResults(): void
    {
        // 2 runs en 2026, 1 run en 2025 — distinct timestamps per unique constraint
        RunFactory::createOne([
            'startDate' => new \DateTimeImmutable('2026-05-12 08:00:00'),
            'endDate' => new \DateTimeImmutable('2026-05-12 08:30:00'),
        ]);
        RunFactory::createOne([
            'startDate' => new \DateTimeImmutable('2026-05-12 09:00:00'),
            'endDate' => new \DateTimeImmutable('2026-05-12 09:30:00'),
        ]);
        RunFactory::createOne([
            'startDate' => new \DateTimeImmutable('2025-05-12 08:00:00'),
            'endDate' => new \DateTimeImmutable('2025-05-12 08:30:00'),
        ]);

        $response = static::createClient()->request('GET', self::ROUTE.'?edition=2026', [
            'headers' => ['Accept' => 'application/json'],
        ]);
        $this->assertResponseIsSuccessful();
        $this->assertCount(2, $response->toArray());

        $response = static::createClient()->request('GET', self::ROUTE.'?edition=2025', [
            'headers' => ['Accept' => 'application/json'],
        ]);
        $this->assertResponseIsSuccessful();
        $this->assertCount(1, $response->toArray());
    }

    public function testGetCollectionReturnsPublicCacheHeaders(): void
    {
        RunFactory::createOne();

        $response = static::createClient()->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
        // cacheHeaders: ['max_age' => 30, 'shared_max_age' => 30, 'public' => true]
        $this->assertResponseHasHeader('cache-control');
        $cacheControl = $response->getHeaders()['cache-control'][0] ?? '';
        $this->assertStringContainsString('public', $cacheControl);
        $this->assertStringContainsString('max-age=30', $cacheControl);
    }

    public function testCollectionShapeMatchesAdminCollection(): void
    {
        RunFactory::createOne();

        $response = static::createClient()->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/json'],
        ]);
        $data = $response->toArray();

        // RunCollection DTO — public exposes the same fields as admin so the
        // shared chart / stats components work without conditionals.
        $this->assertArrayHasKey('id', $data[0]);
        $this->assertArrayHasKey('startDate', $data[0]);
        $this->assertArrayHasKey('endDate', $data[0]);
        $this->assertArrayHasKey('participantsCount', $data[0]);
    }
}
