<?php

namespace App\Tests\Functional\Api\EventSubscriber;

use App\Tests\Functional\Api\AbstractTestCase;
use Symfony\Component\BrowserKit\Cookie;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Covers CsrfTokenSubscriber — double-submit cookie protection on POST and
 * GET /race_medias. Complements RaceMediaTest which tests normal CSRF flow.
 */
final class CsrfTokenSubscriberTest extends AbstractTestCase
{
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

    public function testPostWithMismatchedHeaderAndCookieFails(): void
    {
        $client = static::createClient();
        // Cookie and header have different values
        $client->getCookieJar()->set(new Cookie('XSRF-TOKEN', 'cookie-value', null, '/', 'localhost'));

        $client->request('POST', '/race_medias', [
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'multipart/form-data',
                'X-XSRF-TOKEN' => 'different-header-value',
            ],
            'extra' => [
                'files' => ['file' => $this->makeUploadedFile()],
            ],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testPostWithCookieButNoHeaderFails(): void
    {
        $client = static::createClient();
        $client->getCookieJar()->set(new Cookie('XSRF-TOKEN', 'some-token', null, '/', 'localhost'));

        $client->request('POST', '/race_medias', [
            'headers' => [
                'Accept' => 'application/json',
                'Content-Type' => 'multipart/form-data',
                // No X-XSRF-TOKEN header
            ],
            'extra' => [
                'files' => ['file' => $this->makeUploadedFile()],
            ],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testGetCollectionWithoutCsrfSucceeds(): void
    {
        // GET /race_medias is public read-only — no CSRF required so the
        // anonymous race-status pages can load the media gallery.
        static::createClient()->request('GET', '/race_medias', [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
    }

    public function testNonProtectedRouteDoesNotRequireCsrf(): void
    {
        // GET /public/runs is not in PROTECTED_ROUTES — no CSRF needed
        static::createClient()->request('GET', '/public/runs', [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
    }
}
