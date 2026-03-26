<?php

namespace App\Dto\RaceMedia;

use App\Entity\RaceMedia;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[Map(source: RaceMedia::class)]
class RaceMediaCollection
{
    public ?int $id = null;

    #[Map(source: 'filePath')]
    public ?string $filePath = null;

    public ?\DateTimeInterface $createdAt = null;
}
