<?php

namespace App\Api\Run\Dto;

use App\Entity\Run as RunEntity;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[Map(target: RunEntity::class)]
final class UpdateRun
{
    public ?\DateTime $startDate;

    public ?\DateTime $endDate;
}
