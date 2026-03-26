<?php

namespace App\ApiResource\Run;

use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\State\Options;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Dto\Run\CreateRun;
use App\Dto\Run\RunCollection;
use App\Dto\Run\UpdateRun;
use App\Entity\Run;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[ApiResource(
    shortName: 'Run',
    stateOptions: new Options(entityClass: Run::class),
    operations: [
        new GetCollection(output: RunCollection::class),
        new Get(),
        new Post(
            input: CreateRun::class,
        ),
        new Patch(
            input: UpdateRun::class,
        ),
        new Delete(),
    ],
    security: 'is_granted("ROLE_ADMIN")',
)]
#[Map(source: Run::class)]
#[ApiFilter(SearchFilter::class, properties: ['id' => 'exact'])]
#[ApiFilter(OrderFilter::class, properties: ['id', 'startDate', 'endDate'])]
#[ApiFilter(DateFilter::class, properties: ['startDate', 'endDate'])]
final class RunApi
{
    public ?int $id = null;

    public \DateTimeInterface $startDate;

    public \DateTimeInterface $endDate;

    /** @var iterable<string> */
    public iterable $participations = [];

    #[Map(source: 'participantsCount')]
    public int $participantsCount = 0;

    #[Map(source: 'inProgressParticipantsCount')]
    public int $inProgressParticipantsCount = 0;

    #[Map(source: 'finishedParticipantsCount')]
    public int $finishedParticipantsCount = 0;

    public ?\DateTimeInterface $createdAt = null;

    public ?\DateTimeInterface $updatedAt = null;
}
