<?php

namespace App\ApiResource\Participation;

use ApiPlatform\Doctrine\Common\Filter\OrderFilterInterface;
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
use App\Dto\Participation\CreateParticipation;
use App\Dto\Participation\DataMatrixInput;
use App\Dto\Participation\ParticipationCollection;
use App\Dto\Participation\UpdateParticipation;
use App\Dto\Run\RunRef;
use App\Dto\User\UserRef;
use App\Entity\Participation;
use App\ObjectMapper\RelationTransformer;
use App\State\ParticipationFinishedProcessor;
use App\State\User\EditionParameterProvider;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[ApiResource(
    shortName: 'Participation',
    stateOptions: new Options(entityClass: Participation::class),
    operations: [
        new GetCollection(
            output: ParticipationCollection::class,
            security: 'is_granted("ROLE_ADMIN") or is_granted("PARTICIPATION_VIEW", object)',
        ),
        new GetCollection(
            uriTemplate: '/public/participations',
            output: ParticipationCollection::class,
            cacheHeaders: ['max_age' => 15, 'shared_max_age' => 15, 'public' => true],
            parameters: [
                'edition' => new QueryParameter(
                    filter: new ExactFilter(),
                    property: 'run.edition',
                    provider: EditionParameterProvider::class,
                ),
            ],
        ),
        new Get(
            security: 'is_granted("ROLE_ADMIN") or is_granted("PARTICIPATION_VIEW", object)',
        ),
        new Post(
            security: 'is_granted("ROLE_ADMIN")',
            input: CreateParticipation::class,
        ),
        new Post(
            uriTemplate: '/participations/finished',
            inputFormats: ['json' => ['application/json']],
            security: 'is_granted("ROLE_ADMIN") or is_granted("PARTICIPATION_VIEW", object)',
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
)]
#[Map(source: Participation::class)]
#[ApiFilter(SearchFilter::class, properties: ['id' => 'exact', 'run' => 'exact', 'run.id' => 'exact', 'user' => 'exact', 'user.id' => 'exact', 'user.firstName' => 'istart', 'user.lastName' => 'istart', 'user.surname' => 'istart', 'status' => 'exact'])]
#[ApiFilter(OrderFilter::class, properties: ['id', 'run.id', 'arrivalTime' => ['nulls_comparison' => OrderFilterInterface::NULLS_ALWAYS_LAST]])]
#[ApiFilter(DateFilter::class, properties: ['run.startDate', 'run.endDate', 'arrivalTime'])]
final class ParticipationApi
{
    public ?int $id = null;

    #[Map(transform: RelationTransformer::class)]
    public RunRef $run;

    #[Map(transform: RelationTransformer::class)]
    public UserRef $user;

    public ?\DateTimeInterface $arrivalTime = null;

    #[Map(source: 'totalTime')]
    public ?int $totalTime = null;

    #[Map(source: 'status')]
    public string $status = 'IN_PROGRESS';
}
