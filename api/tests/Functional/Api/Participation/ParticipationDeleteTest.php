<?php

namespace App\Tests\Functional\Api\Participation;

use App\Entity\Participation;
use App\Factory\ParticipationFactory;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;

final class ParticipationDeleteTest extends AbstractTestCase
{
    private const string ROUTE = '/participations';

    public function testDeleteParticipationAsAdmin(): void
    {
        $participation = ParticipationFactory::createOne();
        $id = $participation->getId();

        $this->createClientWithCredentials()->request('DELETE', self::ROUTE.'/'.$id);

        $this->assertResponseStatusCodeSame(204);
        $this->assertNull(
            static::getContainer()->get('doctrine')->getRepository(Participation::class)->find($id)
        );
    }

    public function testDeleteParticipationForbiddenForUser(): void
    {
        $participation = ParticipationFactory::createOne();
        $user = UserFactory::createOne();

        $this->createClientWithCredentials($user)->request('DELETE', self::ROUTE.'/'.$participation->getId());

        $this->assertResponseStatusCodeSame(403);
    }
}
