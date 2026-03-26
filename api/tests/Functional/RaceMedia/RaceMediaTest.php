<?php

namespace App\Tests\Functional\RaceMedia;

use App\Entity\RaceMedia;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class RaceMediaTest extends AbstractTestCase
{
    public function testUploadRaceMedia(): void
    {
        $user = UserFactory::createOne(['roles' => ['ROLE_ADMIN']]);
        $client = $this->createClientWithCredentials($user);

        // Create a dummy image file for upload
        $imageContent = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
        $tempFilePath = tempnam(sys_get_temp_dir(), 'test_img_').'.png';
        file_put_contents($tempFilePath, $imageContent);

        $uploadedFile = new UploadedFile(
            $tempFilePath,
            'test.png',
            'image/png',
            null,
            true
        );

        $client->request('POST', '/race_medias', [
            'headers' => [
                'Content-Type' => 'multipart/form-data',
                'Accept' => 'application/ld+json',
            ],
            'extra' => [
                'files' => [
                    'file' => $uploadedFile,
                ],
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            '@context' => '/contexts/RaceMedia',
            '@type' => 'RaceMedia',
        ]);

        $response = $client->getResponse();
        $responseData = json_decode($response->getContent(), true);

        $this->assertArrayHasKey('filePath', $responseData);
        $this->assertNotNull($responseData['filePath']);
        $this->assertStringEndsWith('.png', $responseData['filePath']);

        // Verify it was persisted
        $this->assertCount(1, $this->getContainer()->get('doctrine')->getRepository(RaceMedia::class)->findAll());

        unlink($tempFilePath);
    }

    public function testGetRaceMediasCollection(): void
    {
        $user = UserFactory::createOne(['roles' => ['ROLE_ADMIN']]);

        // Setup some media
        $media = new RaceMedia();
        $media->setFilePath('dummy.png');

        $em = $this->getContainer()->get('doctrine')->getManager();
        $em->persist($media);
        $em->flush();

        $client = $this->createClientWithCredentials($user);

        $client->request('GET', '/race_medias', [
            'headers' => ['Accept' => 'application/ld+json'],
        ]);

        $this->assertResponseStatusCodeSame(200);
        $this->assertJsonContains([
            '@context' => '/contexts/RaceMedia',
            '@id' => '/race_medias',
            '@type' => 'Collection',
            'totalItems' => 1,
        ]);

        $response = $client->getResponse();
        $responseData = json_decode($response->getContent(), true);

        $this->assertCount(1, $responseData['member']);
        $this->assertSame('dummy.png', $responseData['member'][0]['filePath']);
    }
}
