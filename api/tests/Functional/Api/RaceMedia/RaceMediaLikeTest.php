<?php

namespace App\Tests\Functional\Api\RaceMedia;

use App\Entity\RaceMedia;
use App\Factory\RaceMediaFactory;
use App\Tests\Functional\Api\AbstractTestCase;

/**
 * Covers POST /race_medias/{id}/like — increments likesCount, no auth required.
 */
final class RaceMediaLikeTest extends AbstractTestCase
{
    public function testLikeIncreasesCount(): void
    {
        $media = RaceMediaFactory::createOne(['likesCount' => 0]);
        $id = $media->getId();

        $response = static::createClient()->request('POST', '/race_medias/'.$id.'/like', [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
        $data = $response->toArray();
        $this->assertArrayHasKey('likesCount', $data);
        $this->assertSame(1, $data['likesCount']);
    }

    public function testLikeIsIdempotentPerCall(): void
    {
        $media = RaceMediaFactory::createOne(['likesCount' => 5]);
        $id = $media->getId();

        // Each call increments by 1
        $client = static::createClient();
        $client->request('POST', '/race_medias/'.$id.'/like', [
            'headers' => ['Accept' => 'application/json'],
        ]);
        $this->assertResponseIsSuccessful();

        $response = $client->request('POST', '/race_medias/'.$id.'/like', [
            'headers' => ['Accept' => 'application/json'],
        ]);
        $this->assertResponseIsSuccessful();
        $data = $response->toArray();
        $this->assertSame(7, $data['likesCount']);
    }

    public function testLikeNonExistentMediaReturns500(): void
    {
        static::createClient()->request('POST', '/race_medias/999999/like', [
            'headers' => ['Accept' => 'application/json'],
        ]);

        // The processor throws RuntimeException when not found which becomes 500
        $this->assertResponseStatusCodeSame(500);
    }

    public function testLikeAnonymousIsAllowed(): void
    {
        $media = RaceMediaFactory::createOne(['likesCount' => 0]);
        $id = $media->getId();

        // No authentication needed
        static::createClient()->request('POST', '/race_medias/'.$id.'/like', [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
    }

    public function testLikePersistsInDatabase(): void
    {
        $media = RaceMediaFactory::createOne(['likesCount' => 3]);
        $id = $media->getId();

        static::createClient()->request('POST', '/race_medias/'.$id.'/like', [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();

        // Verify the DB value changed
        $em = static::getContainer()->get('doctrine')->getManager();
        $em->clear();
        $refreshed = $em->getRepository(RaceMedia::class)->find($id);
        $this->assertNotNull($refreshed);
        $this->assertSame(4, $refreshed->likesCount);
    }
}
