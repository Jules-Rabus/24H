<?php

namespace App\Tests\Functional\Api\Run;

use App\Api\Run\Resource\Run;
use App\Factory\RunFactory;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;

final class RunGetTest extends AbstractTestCase
{
    private const string ROUTE = '/runs';

    public function testGetCollectionAsAdmin(): void
    {
        $client = $this->createClientWithCredentials();
        RunFactory::createMany(3);

        $response = $client->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/ld+json'],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');
        $this->assertJsonContains([
            '@context' => '/contexts/Run',
            '@type' => 'Collection',
            'totalItems' => 3,
        ]);
        $this->assertCount(3, $response->toArray()['member']);
        $this->assertMatchesResourceCollectionJsonSchema(Run::class);
    }

    public function testGetCollectionForbiddenForUser(): void
    {
        $user = UserFactory::createOne();

        $this->createClientWithCredentials($user)->request('GET', self::ROUTE);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testGetRunAsAdmin(): void
    {
        $run = RunFactory::createOne();

        $this->createClientWithCredentials()->request('GET', self::ROUTE.'/'.$run->getId(), [
            'headers' => ['Accept' => 'application/ld+json'],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertMatchesResourceItemJsonSchema(Run::class);
    }
}
