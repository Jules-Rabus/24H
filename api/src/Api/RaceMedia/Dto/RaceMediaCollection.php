<?php

namespace App\Api\RaceMedia\Dto;

use Symfony\Component\ObjectMapper\Attribute\Map;

class RaceMediaCollection
{
    public ?int $id = null;

    #[Map(source: 'filePath')]
    public ?string $filePath = null;

    #[Map(source: 'runner.id')]
    public ?int $runnerId = null;

    public ?\DateTimeInterface $createdAt = null;
}
