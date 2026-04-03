<?php

namespace App\Tests\Functional\Api\RaceMedia;

use ApiPlatform\Symfony\Bundle\Test\Client;
use App\ApiResource\RaceMedia\RaceMediaApi;
use App\Entity\RaceMedia;
use App\Factory\RaceMediaFactory;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;
use Symfony\Component\BrowserKit\Cookie;
use Symfony\Component\HttpFoundation\File\UploadedFile;

final class RaceMediaTest extends AbstractTestCase
{
    private const string ROUTE = '/race_medias';
    private const string FIXTURE_IMAGE = __DIR__.'/../Medias/fixtures/test-image.jpg';

    /**
     * Sets the XSRF-TOKEN cookie on the client and returns the token value for the header.
     */
    private function withCsrfToken(Client $client): string
    {
        $token = bin2hex(random_bytes(32));
        $client->getCookieJar()->set(new Cookie('XSRF-TOKEN', $token, null, '/', 'localhost'));

        return $token;
    }

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

    public function testGetRaceMediaCollectionRequiresCsrf(): void
    {
        RaceMediaFactory::createMany(3);

        $this->createClientWithCredentials()->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testGetRaceMediaCollectionWithCsrf(): void
    {
        RaceMediaFactory::createMany(3);

        $client = $this->createClientWithCredentials();
        $csrfToken = $this->withCsrfToken($client);

        $response = $client->request('GET', self::ROUTE, [
            'headers' => [
                'Accept' => 'application/json',
                'X-XSRF-TOKEN' => $csrfToken,
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertCount(3, $response->toArray());
        $this->assertMatchesResourceCollectionJsonSchema(RaceMediaApi::class);
    }

    public function testCreateRaceMediaAsAdmin(): void
    {
        $client = $this->createClientWithCredentials();
        $csrfToken = $this->withCsrfToken($client);

        $response = $client->request('POST', self::ROUTE, [
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'multipart/form-data',
                'X-XSRF-TOKEN' => $csrfToken,
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

    public function testCreateRaceMediaAsAnonymousWithCsrf(): void
    {
        $client = static::createClient();
        $csrfToken = $this->withCsrfToken($client);

        $client->request('POST', self::ROUTE, [
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'multipart/form-data',
                'X-XSRF-TOKEN' => $csrfToken,
            ],
            'extra' => [
                'files' => ['file' => $this->makeUploadedFile()],
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
    }

    public function testCreateRaceMediaWithoutCsrfFails(): void
    {
        static::createClient()->request('POST', self::ROUTE, [
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
