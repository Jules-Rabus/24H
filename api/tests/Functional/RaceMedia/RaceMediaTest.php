<?php

namespace App\Tests\Functional\RaceMedia;

use App\ApiResource\RaceMedia\RaceMediaApi;
use App\Entity\RaceMedia;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;
use Symfony\Component\BrowserKit\Cookie;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class RaceMediaTest extends AbstractTestCase
{
    public function testUploadRaceMedia(): void
    {
        $user = UserFactory::createOne(['roles' => ['ROLE_ADMIN']]);
        $client = $this->createClientWithCredentials($user);

        $csrfToken = bin2hex(random_bytes(32));
        $client->getCookieJar()->set(new Cookie('XSRF-TOKEN', $csrfToken, null, '/', 'localhost'));

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
                'Accept' => 'application/json',
                'X-XSRF-TOKEN' => $csrfToken,
            ],
            'extra' => [
                'files' => [
                    'file' => $uploadedFile,
                ],
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);

        $response = $client->getResponse();
        $responseData = json_decode($response->getContent(), true);

        $this->assertArrayHasKey('contentUrl', $responseData);
        $this->assertNotNull($responseData['contentUrl']);
        $this->assertStringStartsWith('http', $responseData['contentUrl']);
        $this->assertStringContainsString('.png', $responseData['contentUrl']);
        $this->assertIsInt($responseData['id']);
        $this->assertMatchesResourceItemJsonSchema(RaceMediaApi::class);

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

        $csrfToken = bin2hex(random_bytes(32));
        $client->getCookieJar()->set(new Cookie('XSRF-TOKEN', $csrfToken, null, '/', 'localhost'));

        $response = $client->request('GET', '/race_medias', [
            'headers' => [
                'Accept' => 'application/json',
                'X-XSRF-TOKEN' => $csrfToken,
            ],
        ]);

        $this->assertResponseStatusCodeSame(200);

        $data = $response->toArray();
        $this->assertCount(1, $data);
        $this->assertStringContainsString('dummy.png', $data[0]['contentUrl']);
        $this->assertMatchesResourceCollectionJsonSchema(RaceMediaApi::class);
    }
}
