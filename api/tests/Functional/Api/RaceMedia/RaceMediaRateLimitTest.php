<?php

namespace App\Tests\Functional\Api\RaceMedia;

use ApiPlatform\Symfony\Bundle\Test\Client;
use App\Tests\Functional\Api\AbstractTestCase;
use Symfony\Component\BrowserKit\Cookie;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Covers the per-browser rate limiter on POST /race_medias.
 *
 * The limit is keyed on the XSRF-TOKEN cookie (set on first GET /csrf-token)
 * — using the same cookie across requests = same bucket; rotating the cookie
 * resets the quota. The framework.yaml configuration is 10 uploads / hour.
 *
 * @group rate-limit
 */
final class RaceMediaRateLimitTest extends AbstractTestCase
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

    private function withCsrfToken(Client $client, ?string $token = null): string
    {
        $token ??= bin2hex(random_bytes(32));
        $client->getCookieJar()->set(new Cookie('XSRF-TOKEN', $token, null, '/', 'localhost'));

        return $token;
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

    private function uploadOnce(Client $client, string $csrfToken): int
    {
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

        return $client->getResponse()->getStatusCode();
    }

    public function testFirstAnonymousUploadIsAccepted(): void
    {
        $client = static::createClient();
        $csrfToken = $this->withCsrfToken($client);

        $status = $this->uploadOnce($client, $csrfToken);

        $this->assertSame(201, $status);
    }

    public function testEleventhUploadIsRateLimited(): void
    {
        $client = static::createClient();
        $csrfToken = $this->withCsrfToken($client);

        // 10 uploads are allowed by the public_media_upload limiter
        // (framework.yaml: sliding_window, limit: 10, interval: '1 hour').
        for ($i = 1; $i <= 10; ++$i) {
            $status = $this->uploadOnce($client, $csrfToken);
            $this->assertSame(201, $status, "Upload #{$i} should be accepted, got HTTP $status");
        }

        // 11th request must be rejected — same XSRF cookie = same bucket.
        $status = $this->uploadOnce($client, $csrfToken);
        $this->assertSame(429, $status);
    }

    public function testQuotaIsKeyedPerCsrfCookieNotPerIp(): void
    {
        // Same IP (always 127.0.0.1 in tests), but two distinct browsers =
        // two distinct XSRF-TOKEN cookies = two independent buckets.
        $clientA = static::createClient();
        $tokenA = $this->withCsrfToken($clientA);

        // Exhaust client A's quota.
        for ($i = 1; $i <= 10; ++$i) {
            $this->uploadOnce($clientA, $tokenA);
        }
        $this->assertSame(429, $this->uploadOnce($clientA, $tokenA));

        // Client B (new cookie) should still be allowed even though it shares
        // the same source IP.
        $clientB = static::createClient();
        $tokenB = $this->withCsrfToken($clientB, bin2hex(random_bytes(32)));
        $this->assertSame(201, $this->uploadOnce($clientB, $tokenB));
    }
}
