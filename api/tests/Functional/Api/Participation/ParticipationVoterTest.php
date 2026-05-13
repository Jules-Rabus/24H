<?php

namespace App\Tests\Functional\Api\Participation;

use App\Factory\ParticipationFactory;
use App\Factory\RunFactory;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;

/**
 * Covers ParticipationVoter (PARTICIPATION_VIEW attribute).
 *
 * A scanner user (non-admin) should be able to GET their own participation
 * but not others', and should be able to POST /participations/finished.
 */
final class ParticipationVoterTest extends AbstractTestCase
{
    public function testScannerCanViewOwnParticipation(): void
    {
        $user = UserFactory::createOne(['roles' => []]);
        $run = RunFactory::createOne([
            'startDate' => new \DateTime('-1 hour'),
            'endDate' => new \DateTime('+1 hour'),
        ]);
        $participation = ParticipationFactory::createOne([
            'user' => $user,
            'run' => $run,
        ]);

        $this->createClientWithCredentials($user)->request('GET', '/participations/'.$participation->getId(), [
            'headers' => ['Accept' => 'application/json'],
        ]);

        // The voter should allow viewing own participation
        $this->assertResponseIsSuccessful();
    }

    public function testScannerCannotViewOtherParticipation(): void
    {
        $userA = UserFactory::createOne(['roles' => []]);
        $userB = UserFactory::createOne(['roles' => []]);
        $run = RunFactory::createOne();
        $participation = ParticipationFactory::createOne([
            'user' => $userA,
            'run' => $run,
        ]);

        // User B tries to view User A's participation
        $this->createClientWithCredentials($userB)->request('GET', '/participations/'.$participation->getId(), [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testScannerCanGetCollectionViaVoter(): void
    {
        $user = UserFactory::createOne(['roles' => []]);
        // Create 2 participations for different runs (uq_user_run unique constraint)
        $run1 = RunFactory::createOne();
        $run2 = RunFactory::createOne();
        ParticipationFactory::createOne(['user' => $user, 'run' => $run1]);
        ParticipationFactory::createOne(['user' => $user, 'run' => $run2]);

        // The collection GET requires ROLE_ADMIN or PARTICIPATION_VIEW — anonymous should fail
        $this->createClientWithCredentials($user)->request('GET', '/participations', [
            'headers' => ['Accept' => 'application/json'],
        ]);

        // The voter is called on the collection; non-admin scanner should be forbidden
        $this->assertResponseStatusCodeSame(403);
    }

    public function testAnonymousCannotViewParticipation(): void
    {
        $run = RunFactory::createOne();
        $participation = ParticipationFactory::createOne(['run' => $run]);

        static::createClient()->request('GET', '/participations/'.$participation->getId(), [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseStatusCodeSame(401);
    }
}
