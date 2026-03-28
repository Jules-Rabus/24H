<?php

namespace App\Api\Run\Dto;

use App\Entity\Run as RunEntity;
use Symfony\Component\ObjectMapper\Attribute\Map;
use Symfony\Component\Validator\Constraints as Assert;

#[Map(target: RunEntity::class)]
final class CreateRun
{
    #[Assert\NotNull]
    #[Assert\LessThan(propertyPath: 'endDate')]
    #[Assert\GreaterThanOrEqual('now')]
    public \DateTime $startDate;

    #[Assert\NotNull]
    #[Assert\GreaterThan(propertyPath: 'startDate')]
    #[Assert\GreaterThanOrEqual('now')]
    public \DateTime $endDate;
}
