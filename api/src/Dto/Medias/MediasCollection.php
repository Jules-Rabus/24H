<?php

namespace App\Dto\Medias;

use App\Entity\Medias;
use App\ObjectMapper\MediasContentUrlTransformer;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[Map(source: Medias::class)]
final class MediasCollection
{
    public int $id;

    #[Map(source: 'filePath', transform: MediasContentUrlTransformer::class)]
    public ?string $contentUrl = null;

    #[Map(if: false)]
    public ?string $runner = null;
}
