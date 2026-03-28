<?php

namespace App\Dto\RaceMedia;

use App\Entity\RaceMedia;
use App\ObjectMapper\RaceMediaContentUrlTransformer;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[Map(source: RaceMedia::class)]
final class RaceMediaCollection
{
    public int $id;

    #[Map(source: 'filePath', transform: RaceMediaContentUrlTransformer::class)]
    public ?string $contentUrl = null;

    public ?string $comment = null;

    public ?\DateTimeInterface $createdAt = null;
}
