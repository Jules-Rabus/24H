<?php

namespace App\Tests\Unit\Serializer;

use App\Serializer\UploadedFileDenormalizer;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\File\File;

/**
 * Unit tests for UploadedFileDenormalizer.
 */
class UploadedFileDenormalizerTest extends TestCase
{
    public function testSupportsDenormalizationWhenDataIsFile(): void
    {
        $denormalizer = new UploadedFileDenormalizer();

        // Create a temp file to test with
        $tmpFile = tempnam(sys_get_temp_dir(), 'test');
        $file = new File($tmpFile, false);

        $this->assertTrue($denormalizer->supportsDenormalization($file, File::class));
    }

    public function testDoesNotSupportDenormalizationWhenNotFile(): void
    {
        $denormalizer = new UploadedFileDenormalizer();
        $this->assertFalse($denormalizer->supportsDenormalization('string', File::class));
        $this->assertFalse($denormalizer->supportsDenormalization([], File::class));
    }

    public function testDenormalizeReturnsDataAsIs(): void
    {
        $denormalizer = new UploadedFileDenormalizer();

        $tmpFile = tempnam(sys_get_temp_dir(), 'test');
        $file = new File($tmpFile, false);

        $result = $denormalizer->denormalize($file, File::class);
        $this->assertSame($file, $result);
    }

    public function testGetSupportedTypes(): void
    {
        $denormalizer = new UploadedFileDenormalizer();
        $types = $denormalizer->getSupportedTypes(null);
        $this->assertArrayHasKey(File::class, $types);
        $this->assertTrue($types[File::class]);
    }
}
