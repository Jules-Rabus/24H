<?php

namespace App\Dto\Participation;

use App\Entity\Participation;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[Map(target: Participation::class)]
final class UpdateParticipation
{
    public ?\DateTime $arrivalTime;
}
