<?php

namespace App\Dto\Medias;

use App\Entity\Medias;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[Map(source: Medias::class)]
final class MediasCollection
{
    public int $id;

    #[Map(source: 'filePath')]
    public ?string $filePath = null;

    #[Map(if: false)]
    public ?string $runner = null;
}
