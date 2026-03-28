<?php

namespace App\Tests\Functional\Api\Medias;

use App\Entity\Medias;
use App\Factory\MediasFactory;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;

final class MediasTest extends AbstractTestCase
{
    private const string MEDIAS_ROUTE = '/medias';
    private const string FIXTURE_IMAGE = __DIR__.'/fixtures/test-image.jpg';

    protected function tearDown(): void
    {
        $uploadDir = \dirname(__DIR__, 5).'/var/test-uploads/images/users';
        if (is_dir($uploadDir)) {
            foreach (glob($uploadDir.'/*') ?: [] as $file) {
                if (is_file($file)) {
                    unlink($file);
                }
            }
        }

        parent::tearDown();
    }

    private function makeUploadedFile(): UploadedFile
    {
        $tmpFile = sys_get_temp_dir().'/test-image-'.uniqid().'.jpg';
        copy(self::FIXTURE_IMAGE, $tmpFile);

        return new UploadedFile(
            path: $tmpFile,
            originalName: 'test-image.jpg',
            mimeType: 'image/jpeg',
            error: \UPLOAD_ERR_OK,
            test: true,
        );
    }

    public function testUploadImageAsAdmin(): void
    {
        $runner = UserFactory::createOne();
        $route = '/users/'.$runner->getId().'/image';

        $response = $this->createClientWithCredentials()->request('POST', $route, [
            'headers' => [
                'Accept' => 'application/ld+json',
                'Content-Type' => 'multipart/form-data',
            ],
            'extra' => [
                'files' => ['file' => $this->makeUploadedFile()],
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');

        $data = $response->toArray();
        $this->assertSame('Medias', $data['@type']);
        $this->assertArrayHasKey('filePath', $data);
        $this->assertNotNull($data['filePath']);
        $this->assertStringContainsString('/images/users/', $data['filePath']);
        $this->assertMatchesRegularExpression('~^/medias/\d+$~', $data['@id']);
    }

    public function testUploadForbiddenForNonAdmin(): void
    {
        $user = UserFactory::createOne();
        $route = '/users/'.$user->getId().'/image';

        $this->createClientWithCredentials($user)->request('POST', $route, [
            'headers' => [
                'Accept' => 'application/ld+json',
                'Content-Type' => 'multipart/form-data',
            ],
            'extra' => [
                'files' => ['file' => $this->makeUploadedFile()],
            ],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testGetMediasItemAsAdmin(): void
    {
        $media = MediasFactory::createOne();

        $this->createClientWithCredentials()->request('GET', self::MEDIAS_ROUTE.'/'.$media->getId(), [
            'headers' => ['Accept' => 'application/ld+json'],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@type' => 'Medias',
            '@id' => '/medias/'.$media->getId(),
        ]);
    }

    public function testGetMediasCollectionAsAdmin(): void
    {
        MediasFactory::createMany(3);

        $this->createClientWithCredentials()->request('GET', self::MEDIAS_ROUTE, [
            'headers' => ['Accept' => 'application/ld+json'],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['@type' => 'Collection']);
    }

    public function testGetMediasCollectionForbiddenForNonAdmin(): void
    {
        $user = UserFactory::createOne();

        $this->createClientWithCredentials($user)->request('GET', self::MEDIAS_ROUTE, [
            'headers' => ['Accept' => 'application/ld+json'],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testDeleteMediasAsAdmin(): void
    {
        $media = MediasFactory::createOne();
        $id = $media->getId();

        $this->createClientWithCredentials()->request('DELETE', self::MEDIAS_ROUTE.'/'.$id);

        $this->assertResponseStatusCodeSame(204);
        $this->assertNull(
            static::getContainer()->get('doctrine')->getRepository(Medias::class)->find($id)
        );
    }

    public function testDeleteMediasForbiddenForNonAdmin(): void
    {
        $media = MediasFactory::createOne();
        $user = UserFactory::createOne();

        $this->createClientWithCredentials($user)->request('DELETE', self::MEDIAS_ROUTE.'/'.$media->getId());

        $this->assertResponseStatusCodeSame(403);
    }
}
