<?php

namespace App\Tests\Unit\ObjectMapper;

use App\Entity\Medias;
use App\Entity\RaceMedia;
use App\Entity\User;
use App\ObjectMapper\MediasContentUrlTransformer;
use App\ObjectMapper\RaceMediaContentUrlTransformer;
use App\ObjectMapper\UserImageUrlTransformer;
use PHPUnit\Framework\TestCase;
use Vich\UploaderBundle\Storage\StorageInterface;

/**
 * Unit tests for URL transformer callbacks (MediasContentUrl, RaceMediaContentUrl,
 * UserImageUrl). Uses a mock StorageInterface to avoid actual S3 calls.
 */
class UrlTransformerTest extends TestCase
{
    private function makeStorage(string $returnedUri = 'https://s3.example.com/file.jpg'): StorageInterface
    {
        $storage = $this->createMock(StorageInterface::class);
        $storage->method('resolveUri')->willReturn($returnedUri);

        return $storage;
    }

    // ───────────────── MediasContentUrlTransformer ─────────────────

    public function testMediasContentUrlTransformerWithMediasSource(): void
    {
        $t = new MediasContentUrlTransformer($this->makeStorage('https://cdn.example.com/user.jpg'));
        $source = new Medias();
        $result = $t(null, $source, null);
        $this->assertSame('https://cdn.example.com/user.jpg', $result);
    }

    public function testMediasContentUrlTransformerWithNonMediasSource(): void
    {
        $t = new MediasContentUrlTransformer($this->makeStorage());
        $source = new \stdClass();
        $result = $t(null, $source, null);
        $this->assertNull($result);
    }

    // ───────────────── RaceMediaContentUrlTransformer ─────────────────

    public function testRaceMediaContentUrlTransformerWithRaceMediaSource(): void
    {
        $t = new RaceMediaContentUrlTransformer($this->makeStorage('https://cdn.example.com/race.jpg'));
        $source = new RaceMedia();
        $result = $t(null, $source, null);
        $this->assertSame('https://cdn.example.com/race.jpg', $result);
    }

    public function testRaceMediaContentUrlTransformerWithNonRaceMediaSource(): void
    {
        $t = new RaceMediaContentUrlTransformer($this->makeStorage());
        $source = new \stdClass();
        $result = $t(null, $source, null);
        $this->assertNull($result);
    }

    // ───────────────── UserImageUrlTransformer ─────────────────

    public function testUserImageUrlTransformerWithUserHavingImage(): void
    {
        $t = new UserImageUrlTransformer($this->makeStorage('https://cdn.example.com/avatar.jpg'));

        $medias = new Medias();
        $user = new User();
        $user->setImage($medias);

        $result = $t(null, $user, null);
        $this->assertSame('https://cdn.example.com/avatar.jpg', $result);
    }

    public function testUserImageUrlTransformerWithUserHavingNoImage(): void
    {
        $t = new UserImageUrlTransformer($this->makeStorage());

        $user = new User();
        // No image set
        $result = $t(null, $user, null);
        $this->assertNull($result);
    }

    public function testUserImageUrlTransformerWithNonUserSource(): void
    {
        $t = new UserImageUrlTransformer($this->makeStorage());

        $source = new \stdClass();
        $result = $t(null, $source, null);
        $this->assertNull($result);
    }
}
