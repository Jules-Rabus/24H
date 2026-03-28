<?php

namespace App\Api\Run\Dto;

use App\Entity\Run as RunEntity;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[Map(source: RunEntity::class)]
final class RunCollection
{
    public int $id;

    public \DateTimeInterface $startDate;

    public \DateTimeInterface $endDate;

    #[Map(source: 'participantsCount')]
    public int $participantsCount = 0;
}
