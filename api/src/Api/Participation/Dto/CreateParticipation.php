<?php

namespace App\Api\Participation\Dto;

use App\Entity\Participation as ParticipationEntity;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[Map(target: ParticipationEntity::class)]
final class CreateParticipation
{
    public string $run;

    public string $user;

    public ?\DateTimeInterface $arrivalTime = null;
}
