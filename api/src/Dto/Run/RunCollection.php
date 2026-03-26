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
}
