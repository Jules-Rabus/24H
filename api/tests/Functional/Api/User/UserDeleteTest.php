<?php

namespace App\Tests\Functional\Api\User;

use App\Entity\Participation;
use App\Entity\User;
use App\Factory\ParticipationFactory;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;

final class UserDeleteTest extends AbstractTestCase
{
    private const string ROUTE = '/users';

    public function testDeleteUserAsAdmin(): void
    {
        $user = UserFactory::createOne();
        $id = $user->getId();

        $this->createClientWithCredentials()->request('DELETE', self::ROUTE.'/'.$id);

        $this->assertResponseStatusCodeSame(204);
        $this->assertNull(
            static::getContainer()->get('doctrine')->getRepository(User::class)->find($id)
        );
    }

    public function testDeleteUserWithParticipationsCascades(): void
    {
        $user = UserFactory::createOne();
        $id = $user->getId();
        ParticipationFactory::createOne(['user' => $user]);

        $this->createClientWithCredentials()->request('DELETE', self::ROUTE.'/'.$id);

        $this->assertResponseStatusCodeSame(204);
        $em = static::getContainer()->get('doctrine')->getManager();
        $this->assertNull($em->getRepository(User::class)->find($id));
        $this->assertEmpty($em->getRepository(Participation::class)->findBy(['user' => $id]));
    }

    public function testDeleteUserForbiddenForOwner(): void
    {
        $user = UserFactory::createOne();

        $this->createClientWithCredentials($user)->request('DELETE', self::ROUTE.'/'.$user->getId());

        $this->assertResponseStatusCodeSame(403);
    }

    public function testDeleteUserForbiddenForWrongUser(): void
    {
        $user = UserFactory::createOne();
        $wrongUser = UserFactory::createOne();

        $this->createClientWithCredentials($wrongUser)->request('DELETE', self::ROUTE.'/'.$user->getId());

        $this->assertResponseStatusCodeSame(403);
    }
}
