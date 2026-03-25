<?php

namespace App\Tests\Functional\Api\Medias;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;
use App\Factory\UserFactory;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Zenstruck\Foundry\Test\Factories;
use Zenstruck\Foundry\Test\ResetDatabase;

class MediasUploadTest extends ApiTestCase
{
    use ResetDatabase;
    use Factories;

    public function testUploadMedia(): void
    {
        $client = static::createClient();

        $admin = UserFactory::createOne(['roles' => ['ROLE_ADMIN'], 'password' => 'password']);
        $client->loginUser($admin);

        // Ensure a dummy file exists for the test
        $filePath = __DIR__.'/fixtures/profile.jpg';
        if (!file_exists($filePath)) {
            if (!is_dir(dirname($filePath))) {
                mkdir(dirname($filePath), 0777, true);
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

        $response = $client->request('POST', '/medias', [
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
