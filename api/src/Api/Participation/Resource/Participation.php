<?php

namespace App\Api\Participation\Resource;

use ApiPlatform\Doctrine\Common\Filter\OrderFilterInterface;
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
use App\Api\Participation\Dto\CreateParticipation;
use App\Api\Participation\Dto\DataMatrixInput;
use App\Api\Participation\Dto\ParticipationCollection;
use App\Api\Participation\Dto\UpdateParticipation;
use App\Entity\Participation as ParticipationEntity;
use App\State\ParticipationFinishedProcessor;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[ApiResource(
    shortName: 'Participation',
    stateOptions: new Options(entityClass: ParticipationEntity::class),
    operations: [
        new GetCollection(output: ParticipationCollection::class),
        new Get(),
        new Post(
            security: 'is_granted("ROLE_ADMIN")',
            input: CreateParticipation::class,
        ),
        new Post(
            uriTemplate: '/participations/finished',
            inputFormats: ['json' => ['application/json']],
            security: 'is_granted("ROLE_ADMIN") or (user and object.getUser().getUserIdentifier() == user.getUserIdentifier())',
            input: DataMatrixInput::class,
            processor: ParticipationFinishedProcessor::class,
        ),
        new Patch(
            security: 'is_granted("ROLE_ADMIN")',
            input: UpdateParticipation::class,
        ),
        new Delete(security: 'is_granted("ROLE_ADMIN")'),
    ],
    mercure: true,
    security: 'is_granted("ROLE_ADMIN") or (user and object.getUser().getUserIdentifier() == user.getUserIdentifier())',
)]
#[Map(source: ParticipationEntity::class)]
#[ApiFilter(SearchFilter::class, properties: ['id' => 'exact', 'run' => 'exact', 'run.id' => 'exact', 'user' => 'exact', 'user.id' => 'exact', 'user.firstName' => 'istart', 'user.lastName' => 'istart', 'user.surname' => 'istart'])]
#[ApiFilter(OrderFilter::class, properties: ['id', 'run.id', 'arrivalTime' => ['nulls_comparison' => OrderFilterInterface::NULLS_ALWAYS_LAST]])]
#[ApiFilter(DateFilter::class, properties: ['run.startDate', 'run.endDate', 'arrivalTime'])]
final class Participation
{
    public ?int $id = null;

    public ?string $run = null;

    public ?string $user = null;

    public ?\DateTimeInterface $arrivalTime = null;

    #[Map(source: 'totalTime')]
    public ?int $totalTime = null;

    #[Map(source: 'status')]
    public string $status = 'IN_PROGRESS';

    public function getUser(): self
    {
        return $this;
    }

    public function getUserIdentifier(): string
    {
        return '';
    }
}
