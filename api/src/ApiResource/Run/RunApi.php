<?php

namespace App\ApiResource\Run;

use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Doctrine\Orm\Filter\ExactFilter;
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
use ApiPlatform\Metadata\QueryParameter;
use App\Dto\Run\CreateRun;
use App\Dto\Run\RunCollection;
use App\Dto\Run\UpdateRun;
use App\Entity\Run;
use App\ObjectMapper\ParticipationCollectionTransformer;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[ApiResource(
    shortName: 'Run',
    operations: [
        new GetCollection(
            output: RunCollection::class,
            security: 'is_granted("ROLE_ADMIN")',
        ),
        new GetCollection(
            uriTemplate: '/runs/public',
            output: RunCollection::class,
            cacheHeaders: ['max_age' => 30, 'shared_max_age' => 30, 'public' => true],
            parameters: [
                'edition' => new QueryParameter(
                    filter: new ExactFilter(),
                    property: 'edition',
                ),
            ],
        ),
        new Get(security: 'is_granted("ROLE_ADMIN")'),
        new Post(
            security: 'is_granted("ROLE_ADMIN")',
            input: CreateRun::class,
        ),
        new Patch(
            security: 'is_granted("ROLE_ADMIN")',
            input: UpdateRun::class,
        ),
        new Delete(
            security: 'is_granted("ROLE_ADMIN")',
            validate: true,
            validationContext: ['groups' => [Run::VALIDATION_GROUP_DELETE]],
        ),
    ],
    stateOptions: new Options(entityClass: Run::class),
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

    public ?int $edition = null;

    /** @var list<int> */
    #[Map(transform: ParticipationCollectionTransformer::class)]
    public array $participations = [];

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

    public ?\DateTimeInterface $createdAt = null;

    public ?\DateTimeInterface $updatedAt = null;
}
