<?php

namespace App\Dto\Run;

use App\Entity\Run;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[Map(source: Run::class)]
final class RunCollection
{
    public int $id;

    public \DateTimeInterface $startDate;

    public \DateTimeInterface $endDate;

    #[Map(source: 'participantsCount')]
    public int $participantsCount = 0;

    #[Map(source: 'inProgressParticipantsCount')]
    public int $inProgressParticipantsCount = 0;

    #[Map(source: 'finishedParticipantsCount')]
    public int $finishedParticipantsCount = 0;

    #[Map(source: 'averageTime')]
    public ?int $averageTime = null;

    #[Map(source: 'fastestTime')]
    public ?int $fastestTime = null;
}
