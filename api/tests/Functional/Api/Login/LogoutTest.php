<?php

namespace App\Tests\Functional\Api\Login;

use App\Tests\Functional\Api\AbstractTestCase;

final class LogoutTest extends AbstractTestCase
{
    private const string ROUTE = '/logout';

    public function testLogoutClearsJwtCookie(): void
    {
        $response = static::createClient()->request('POST', self::ROUTE, [
            'headers' => [
                'Accept' => 'application/json',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/json');
        $this->assertJsonContains([
            'message' => 'Logged out.',
        ]);

        $cookies = $response->getHeaders(false)['set-cookie'] ?? [];

        self::assertNotEmpty($cookies);
        self::assertStringContainsString('BEARER=deleted', $cookies[0]);
        self::assertStringContainsString('path=/', strtolower($cookies[0]));
    }
}
