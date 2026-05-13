<?php

namespace App\Tests\Unit\Encoder;

use App\Encoder\MultipartDecoder;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Unit tests for MultipartDecoder.
 */
class MultipartDecoderTest extends TestCase
{
    private function makeDecoder(?Request $request = null): MultipartDecoder
    {
        $stack = new RequestStack();
        if ($request) {
            $stack->push($request);
        }

        return new MultipartDecoder($stack);
    }

    public function testSupportsDecodingMultipart(): void
    {
        $decoder = $this->makeDecoder();
        $this->assertTrue($decoder->supportsDecoding(MultipartDecoder::FORMAT));
    }

    public function testDoesNotSupportOtherFormats(): void
    {
        $decoder = $this->makeDecoder();
        $this->assertFalse($decoder->supportsDecoding('json'));
        $this->assertFalse($decoder->supportsDecoding('xml'));
    }

    public function testDecodeReturnsNullWhenNoRequest(): void
    {
        $decoder = $this->makeDecoder(null);
        $result = $decoder->decode('', MultipartDecoder::FORMAT);
        $this->assertNull($result);
    }

    public function testDecodeReturnsRequestData(): void
    {
        $request = new Request(
            [], // query
            ['field' => json_encode('value')], // request (POST)
            [],
            [],
            [],
            [],
        );
        $decoder = $this->makeDecoder($request);
        $result = $decoder->decode('', MultipartDecoder::FORMAT);
        $this->assertIsArray($result);
        $this->assertSame('value', $result['field']);
    }
}
