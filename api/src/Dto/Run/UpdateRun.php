<?php

namespace App\Dto\Run;

use App\Entity\Run;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[Map(target: Run::class)]
final class UpdateRun
{
    public ?\DateTimeInterface $startDate;

    public ?\DateTimeInterface $endDate;
}
