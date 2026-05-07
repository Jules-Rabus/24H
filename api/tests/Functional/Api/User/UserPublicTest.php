<?php

namespace App\Tests\Functional\Api\User;

use App\Factory\ParticipationFactory;
use App\Factory\RunFactory;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;

final class UserPublicTest extends AbstractTestCase
{
    private const string ROUTE = '/users/public';

    public function testGetPublicCollection(): void
    {
        UserFactory::createMany(5);

        $response = static::createClient()->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
        // 5 created + 1 admin from setUp
        $this->assertCount(6, $response->toArray());
    }

    public function testGetPublicUser(): void
    {
        $user = UserFactory::createOne();

        $response = static::createClient()->request('GET', self::ROUTE.'/'.$user->getId(), [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
        $data = $response->toArray();
        $this->assertSame($user->getId(), $data['id']);
        $this->assertSame($user->getFirstName(), $data['firstName']);
    }

    public function testEditionFilterNarrowsEmbeddedParticipations(): void
    {
        $currentYear = (int) date('Y');

        $past = RunFactory::createOne([
            'startDate' => new \DateTime(($currentYear - 1).'-06-13 10:00:00'),
            'endDate' => new \DateTime(($currentYear - 1).'-06-13 12:00:00'),
        ]);
        $current = RunFactory::createOne([
            'startDate' => new \DateTime("$currentYear-12-31 10:00:00"),
            'endDate' => new \DateTime("$currentYear-12-31 12:00:00"),
        ]);

        $user = UserFactory::createOne();
        ParticipationFactory::createOne([
            'user' => $user,
            'run' => $past,
            'arrivalTime' => new \DateTime(($currentYear - 1).'-06-13 11:00:00'),
        ]);
        ParticipationFactory::createOne([
            'user' => $user,
            'run' => $current,
        ]);

        $response = static::createClient()->request('GET', self::ROUTE.'?edition='.$currentYear, [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
        $data = $response->toArray();

        $userPayload = null;
        foreach ($data as $row) {
            if (($row['id'] ?? null) === $user->getId()) {
                $userPayload = $row;
                break;
            }
        }
        $this->assertNotNull($userPayload, 'User must appear in the filtered collection');

        $editions = array_map(static fn ($p) => $p['runEdition'] ?? null, $userPayload['participations']);
        $this->assertSame([$currentYear], array_values(array_unique($editions)));
        $this->assertCount(1, $userPayload['participations']);
        // The 2025 finished participation must NOT contribute to 2026 totals.
        $this->assertSame(0, $userPayload['finishedParticipationsCount']);
        $this->assertNull($userPayload['totalTime'] ?? null);
        $this->assertNull($userPayload['bestTime'] ?? null);
        $this->assertNull($userPayload['averageTime'] ?? null);
    }

    public function testItemEditionFilterNarrowsEmbeddedParticipations(): void
    {
        $currentYear = (int) date('Y');

        $past = RunFactory::createOne([
            'startDate' => new \DateTime(($currentYear - 1).'-06-13 10:00:00'),
            'endDate' => new \DateTime(($currentYear - 1).'-06-13 12:00:00'),
        ]);
        $current = RunFactory::createOne([
            'startDate' => new \DateTime("$currentYear-12-31 10:00:00"),
            'endDate' => new \DateTime("$currentYear-12-31 12:00:00"),
        ]);

        $user = UserFactory::createOne();
        ParticipationFactory::createOne(['user' => $user, 'run' => $past]);
        ParticipationFactory::createOne(['user' => $user, 'run' => $current]);

        $response = static::createClient()->request('GET', self::ROUTE.'/'.$user->getId().'?edition='.$currentYear, [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
        $data = $response->toArray();

        $editions = array_map(static fn ($p) => $p['runEdition'] ?? null, $data['participations']);
        $this->assertSame([$currentYear], array_values(array_unique($editions)));
        $this->assertCount(1, $data['participations']);
    }
}
