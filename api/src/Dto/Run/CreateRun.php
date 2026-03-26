<?php

namespace App\Dto\Run;

use App\Entity\Run;
use Symfony\Component\ObjectMapper\Attribute\Map;
use Symfony\Component\Validator\Constraints as Assert;

#[Map(target: Run::class)]
final class CreateRun
{
    #[Assert\NotNull]
    #[Assert\LessThan(propertyPath: 'endDate')]
    #[Assert\GreaterThanOrEqual('now')]
    public \DateTimeInterface $startDate;

    #[Assert\NotNull]
    #[Assert\GreaterThan(propertyPath: 'startDate')]
    #[Assert\GreaterThanOrEqual('now')]
    public \DateTimeInterface $endDate;
}
