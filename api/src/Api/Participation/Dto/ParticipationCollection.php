<?php

namespace App\Api\Participation\Dto;

use App\Entity\Participation as ParticipationEntity;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[Map(source: ParticipationEntity::class)]
final class ParticipationCollection
{
    public int $id;

    public ?string $run = null;

    public ?string $user = null;

    #[Map(source: 'status')]
    public string $status = 'IN_PROGRESS';

    #[Map(source: 'totalTime')]
    public ?int $totalTime = null;
}
