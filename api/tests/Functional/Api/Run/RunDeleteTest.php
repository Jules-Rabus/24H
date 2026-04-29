<?php

namespace App\Tests\Functional\Api\Run;

use App\Entity\Participation;
use App\Entity\Run;
use App\Factory\ParticipationFactory;
use App\Factory\RunFactory;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;

final class RunDeleteTest extends AbstractTestCase
{
    private const string ROUTE = '/runs';

    public function testDeleteRunAsAdmin(): void
    {
        $run = RunFactory::createOne();
        $id = $run->getId();

        $this->createClientWithCredentials()->request('DELETE', self::ROUTE.'/'.$id);

        $this->assertResponseStatusCodeSame(204);
        $this->assertNull(
            static::getContainer()->get('doctrine')->getRepository(Run::class)->find($id)
        );
    }

    public function testDeleteRunForbiddenForUser(): void
    {
        $run = RunFactory::createOne();
        $user = UserFactory::createOne();

        $this->createClientWithCredentials($user)->request('DELETE', self::ROUTE.'/'.$run->getId());

        $this->assertResponseStatusCodeSame(403);
    }

    public function testCannotDeletePastRun(): void
    {
        $run = RunFactory::createOne([
            'startDate' => new \DateTimeImmutable('-7 days'),
            'endDate' => new \DateTimeImmutable('-6 days'),
        ]);

        $this->createClientWithCredentials()->request('DELETE', self::ROUTE.'/'.$run->getId());

        $this->assertResponseStatusCodeSame(422);
        $this->assertNotNull(
            static::getContainer()->get('doctrine')->getRepository(Run::class)->find($run->getId()),
            'A past Run must not be deletable'
        );
    }

    public function testCannotDeleteInProgressRun(): void
    {
        $run = RunFactory::createOne([
            'startDate' => new \DateTimeImmutable('-1 hour'),
            'endDate' => new \DateTimeImmutable('+1 hour'),
        ]);

        $this->createClientWithCredentials()->request('DELETE', self::ROUTE.'/'.$run->getId());

        $this->assertResponseStatusCodeSame(422);
    }

    public function testDeleteFutureRunCascadesToParticipations(): void
    {
        $run = RunFactory::createOne([
            'startDate' => new \DateTimeImmutable('+3 days'),
            'endDate' => new \DateTimeImmutable('+4 days'),
        ]);
        $user = UserFactory::createOne();
        $participation = ParticipationFactory::createOne([
            'run' => $run,
            'user' => $user,
        ]);
        $participationId = $participation->getId();

        $this->createClientWithCredentials()->request('DELETE', self::ROUTE.'/'.$run->getId());

        $this->assertResponseStatusCodeSame(204);
        $em = static::getContainer()->get('doctrine')->getManager();
        $em->clear();
        $this->assertNull(
            $em->getRepository(Run::class)->find($run->getId())
        );
        $this->assertNull(
            $em->getRepository(Participation::class)->find($participationId),
            'Deleting a Run must cascade to its participations'
        );
    }
}
