<?php

namespace App\Tests\Functional\Api\User;

use App\Entity\User;
use App\Factory\ParticipationFactory;
use App\Factory\RunFactory;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;
use Doctrine\ORM\EntityManagerInterface;

final class AddUserToCurrentRunTest extends AbstractTestCase
{
    private function countUserParticipations(int $userId): int
    {
        /** @var EntityManagerInterface $em */
        $em = static::getContainer()->get(EntityManagerInterface::class);
        $em->clear();
        $user = $em->find(User::class, $userId);

        return null === $user ? 0 : $user->getParticipations()->count();
    }

    public function testAddsParticipationForCurrentRun(): void
    {
        $past = RunFactory::createOne([
            'startDate' => new \DateTime('-2 days'),
            'endDate' => new \DateTime('-1 day'),
        ]);
        $current = RunFactory::createOne([
            'startDate' => new \DateTime('-1 hour'),
            'endDate' => new \DateTime('+1 hour'),
        ]);
        $user = UserFactory::createOne();
        ParticipationFactory::createOne(['user' => $user, 'run' => $past]);

        $userId = $user->getId();
        $this->assertSame(1, $this->countUserParticipations($userId));

        $this->createClientWithCredentials()->request('POST', "/users/$userId/add_to_current_run", [
            'headers' => ['Content-Type' => 'application/json', 'Accept' => 'application/json'],
            'json' => new \stdClass(),
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertSame(2, $this->countUserParticipations($userId));
    }

    public function testAttachesAllRunsOfCurrentEditionAndKeepsPastEditions(): void
    {
        $currentYear = (int) date('Y');

        // Past edition — must remain untouched.
        $pastEdition = RunFactory::createOne([
            'startDate' => new \DateTime(($currentYear - 1).'-06-13 10:00:00'),
            'endDate' => new \DateTime(($currentYear - 1).'-06-13 12:00:00'),
        ]);
        // Current edition: one in-progress + one upcoming same year.
        $current1 = RunFactory::createOne([
            'startDate' => new \DateTime('-1 hour'),
            'endDate' => new \DateTime('+1 hour'),
        ]);
        $current2 = RunFactory::createOne([
            'startDate' => new \DateTime("$currentYear-12-31 10:00:00"),
            'endDate' => new \DateTime("$currentYear-12-31 12:00:00"),
        ]);

        $user = UserFactory::createOne();
        ParticipationFactory::createOne(['user' => $user, 'run' => $pastEdition]);
        $userId = $user->getId();

        $this->createClientWithCredentials()->request('POST', "/users/$userId/add_to_current_run", [
            'headers' => ['Content-Type' => 'application/json', 'Accept' => 'application/json'],
            'json' => new \stdClass(),
        ]);

        $this->assertResponseIsSuccessful();

        /** @var EntityManagerInterface $em */
        $em = static::getContainer()->get(EntityManagerInterface::class);
        $em->clear();
        $reloaded = $em->find(User::class, $userId);
        $this->assertNotNull($reloaded);
        $runIds = array_map(static fn ($p) => $p->getRun()->getId(), $reloaded->getParticipations()->toArray());

        $this->assertContains($pastEdition->getId(), $runIds);
        $this->assertContains($current1->getId(), $runIds);
        $this->assertContains($current2->getId(), $runIds);
        $this->assertCount(3, $runIds);
    }

    public function testIsIdempotentWhenAlreadyParticipating(): void
    {
        $current = RunFactory::createOne([
            'startDate' => new \DateTime('-1 hour'),
            'endDate' => new \DateTime('+1 hour'),
        ]);
        $user = UserFactory::createOne();
        ParticipationFactory::createOne(['user' => $user, 'run' => $current]);

        $userId = $user->getId();
        $this->createClientWithCredentials()->request('POST', "/users/$userId/add_to_current_run", [
            'headers' => ['Content-Type' => 'application/json', 'Accept' => 'application/json'],
            'json' => new \stdClass(),
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertSame(1, $this->countUserParticipations($userId));
    }

    public function testReturns404ForUnknownUser(): void
    {
        RunFactory::createOne([
            'startDate' => new \DateTime('-1 hour'),
            'endDate' => new \DateTime('+1 hour'),
        ]);

        $this->createClientWithCredentials()->request('POST', '/users/999999/add_to_current_run', [
            'headers' => ['Content-Type' => 'application/json', 'Accept' => 'application/json'],
            'json' => new \stdClass(),
        ]);

        $this->assertResponseStatusCodeSame(404);
    }

    public function testReturns409WhenNoRunExists(): void
    {
        $user = UserFactory::createOne();

        $this->createClientWithCredentials()->request('POST', "/users/{$user->getId()}/add_to_current_run", [
            'headers' => ['Content-Type' => 'application/json', 'Accept' => 'application/json'],
            'json' => new \stdClass(),
        ]);

        $this->assertResponseStatusCodeSame(409);
    }

    public function testRequiresAdminRole(): void
    {
        RunFactory::createOne([
            'startDate' => new \DateTime('-1 hour'),
            'endDate' => new \DateTime('+1 hour'),
        ]);
        $admin = UserFactory::createOne(['roles' => []]);
        $target = UserFactory::createOne();

        $this->createClientWithCredentials($admin)->request('POST', "/users/{$target->getId()}/add_to_current_run", [
            'headers' => ['Content-Type' => 'application/json', 'Accept' => 'application/json'],
            'json' => new \stdClass(),
        ]);

        $this->assertResponseStatusCodeSame(403);
    }
}
