<?php

namespace App\Dto\Run;

use App\Entity\Run;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[Map(source: Run::class)]
final class RunRef
{
    public ?int $id = null;

    public ?\DateTimeInterface $startDate = null;

    public ?\DateTimeInterface $endDate = null;
}
