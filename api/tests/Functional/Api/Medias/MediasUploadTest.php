<?php

namespace App\Tests\Functional\Api\Medias;

use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class MediasUploadTest extends AbstractTestCase
{
    public function testUploadMedia(): void
    {
        $admin = UserFactory::createOne(['roles' => ['ROLE_ADMIN']]);

        // Ensure a dummy file exists for the test
        $filePath = __DIR__.'/fixtures/profile.jpg';
        if (!file_exists($filePath)) {
            if (!is_dir(\dirname($filePath))) {
                mkdir(\dirname($filePath), 0777, true);
            }
            file_put_contents($filePath, 'dummy image content');
        }

        $file = new UploadedFile(
            $filePath,
            'profile.jpg',
            'image/jpeg',
            null,
            true
        );

        $response = $this->createClientWithCredentials($admin)->request('POST', '/medias', [
            'headers' => [
                'Content-Type' => 'multipart/form-data',
                'Accept' => 'application/ld+json',
            ],
            'extra' => [
                'files' => [
                    'file' => $file,
                ],
                'parameters' => [
                    'runner' => '/users/'.$admin->getId(),
                ],
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            '@context' => '/contexts/Medias',
            '@type' => 'Medias',
            'runner' => '/users/'.$admin->getId(),
        ]);

        $data = $response->toArray();
        $this->assertNotNull($data['filePath']);
        $this->assertStringStartsWith('http', $data['filePath']);
    }
}
