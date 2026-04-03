<?php

namespace App\Dto\Participation;

use App\Dto\Run\RunRef;
use App\Dto\User\UserRef;
use App\Entity\Participation;
use App\ObjectMapper\RelationTransformer;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[Map(source: Participation::class)]
final class ParticipationCollection
{
    public int $id;

    #[Map(transform: RelationTransformer::class)]
    public RunRef $run;

    #[Map(transform: RelationTransformer::class)]
    public UserRef $user;

    public ?\DateTimeInterface $arrivalTime = null;

    #[Map(source: 'status')]
    public string $status = 'IN_PROGRESS';

    #[Map(source: 'totalTime')]
    public ?int $totalTime = null;
}
