<?php

namespace App\Api\Medias\Dto;

use App\Entity\Medias as MediasEntity;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[Map(source: MediasEntity::class)]
final class MediasCollection
{
    public int $id;

    #[Map(source: 'filePath')]
    public ?string $filePath = null;

    #[Map(if: false)]
    public ?string $runner = null;
}
