<?php

namespace App\Tests\Functional\Api\Controller;

use App\Tests\Functional\Api\AbstractTestCase;

/**
 * Covers GET /csrf-token — returns a new XSRF-TOKEN cookie and JSON payload.
 */
final class CsrfTokenControllerTest extends AbstractTestCase
{
    private const string ROUTE = '/csrf-token';

    public function testGetCsrfTokenReturnsToken(): void
    {
        $response = static::createClient()->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/json');

        $data = $response->toArray();
        $this->assertArrayHasKey('token', $data);
        $this->assertIsString($data['token']);
        $this->assertNotEmpty($data['token']);
    }

    public function testGetCsrfTokenSetsCookie(): void
    {
        static::createClient()->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertResponseHasCookie('XSRF-TOKEN');
    }

    public function testCsrfTokenMatchesCookie(): void
    {
        $client = static::createClient();
        $response = $client->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $data = $response->toArray();
        $token = $data['token'];

        // Verify the cookie value matches the returned token
        $cookie = $client->getCookieJar()->get('XSRF-TOKEN');
        $this->assertNotNull($cookie);
        $this->assertSame($token, $cookie->getValue());
    }

    public function testTwoCallsReturnDifferentTokens(): void
    {
        $client = static::createClient();

        $response1 = $client->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/json'],
        ]);
        $token1 = $response1->toArray()['token'];

        $response2 = $client->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/json'],
        ]);
        $token2 = $response2->toArray()['token'];

        // Each call generates a new random token
        $this->assertNotSame($token1, $token2);
    }

    public function testCsrfTokenIsAccessibleWithoutAuth(): void
    {
        // The CSRF token endpoint must be publicly accessible
        static::createClient()->request('GET', self::ROUTE, [
            'headers' => ['Accept' => 'application/json'],
        ]);

        $this->assertResponseIsSuccessful();
    }
}
