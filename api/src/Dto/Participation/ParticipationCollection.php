<?php

namespace App\Dto\Participation;

use App\Entity\Participation;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[Map(source: Participation::class)]
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
