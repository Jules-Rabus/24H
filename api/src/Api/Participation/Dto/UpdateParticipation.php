<?php

namespace App\Api\Participation\Dto;

use App\Entity\Participation as ParticipationEntity;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[Map(target: ParticipationEntity::class)]
final class UpdateParticipation
{
    public ?\DateTimeInterface $arrivalTime;
}
