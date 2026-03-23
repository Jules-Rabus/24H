<?php

namespace App\Tests\Functional\Api\Run;

use App\Entity\Run;
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
}
