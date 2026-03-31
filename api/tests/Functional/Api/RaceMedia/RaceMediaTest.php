<?php

namespace App\Tests\Functional\Api\RaceMedia;

use App\ApiResource\RaceMedia\RaceMediaApi;
use App\Entity\RaceMedia;
use App\Factory\RaceMediaFactory;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;

final class RaceMediaTest extends AbstractTestCase
{
    private const string ROUTE = '/race_medias';
    private const string FIXTURE_IMAGE = __DIR__.'/../Medias/fixtures/test-image.jpg';

    protected function tearDown(): void
    {
        $uploadDir = \dirname(__DIR__, 5).'/var/test-uploads/images/race_medias';
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
        $tmpFile = sys_get_temp_dir().'/test-race-media-'.uniqid().'.jpg';
        copy(self::FIXTURE_IMAGE, $tmpFile);

        return new UploadedFile(
            path: $tmpFile,
            originalName: 'test-image.jpg',
            mimeType: 'image/jpeg',
            error: \UPLOAD_ERR_OK,
            test: true,
        );
    }

    public function testGetRaceMediaItem(): void
    {
        $media = RaceMediaFactory::createOne();

        $response = $this->createClientWithCredentials()->request('GET', self::ROUTE.'/'.$media->getId(), [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
        $data = $response->toArray();
        $this->assertArrayHasKey('id', $data);
        $this->assertArrayHasKey('contentUrl', $data);
        $this->assertArrayHasKey('comment', $data);
        $this->assertMatchesResourceItemJsonSchema(RaceMediaApi::class);
    }

    public function testGetRaceMediaCollection(): void
    {
        RaceMediaFactory::createMany(3);

        $response = $this->createClientWithCredentials()->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertCount(3, $response->toArray());
        $this->assertMatchesResourceCollectionJsonSchema(RaceMediaApi::class);
    }

    public function testCreateRaceMediaAsAdmin(): void
    {
        $response = $this->createClientWithCredentials()->request('POST', self::ROUTE, [
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'multipart/form-data',
            ],
            'extra' => [
                'files' => ['file' => $this->makeUploadedFile()],
                'parameters' => ['comment' => 'A race photo'],
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $data = $response->toArray();
        $this->assertArrayHasKey('id', $data);
        $this->assertArrayHasKey('contentUrl', $data);
        $this->assertSame('A race photo', $data['comment']);
        $this->assertMatchesResourceItemJsonSchema(RaceMediaApi::class);
    }

    public function testCreateRaceMediaForbiddenForUser(): void
    {
        $user = UserFactory::createOne();

        $this->createClientWithCredentials($user)->request('POST', self::ROUTE, [
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'multipart/form-data',
            ],
            'extra' => [
                'files' => ['file' => $this->makeUploadedFile()],
            ],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testDeleteRaceMediaAsAdmin(): void
    {
        $media = RaceMediaFactory::createOne();
        $id = $media->getId();

        $this->createClientWithCredentials()->request('DELETE', self::ROUTE.'/'.$id);

        $this->assertResponseStatusCodeSame(204);
        $this->assertNull(
            static::getContainer()->get('doctrine')->getRepository(RaceMedia::class)->find($id)
        );
    }

    public function testDeleteRaceMediaForbiddenForUser(): void
    {
        $media = RaceMediaFactory::createOne();
        $user = UserFactory::createOne();

        $this->createClientWithCredentials($user)->request('DELETE', self::ROUTE.'/'.$media->getId());

        $this->assertResponseStatusCodeSame(403);
    }
}
