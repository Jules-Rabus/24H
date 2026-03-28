<?php

namespace App\Api\RaceMedia\Resource;

use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\State\Options;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\OpenApi\Model;
use App\Api\RaceMedia\Dto\RaceMediaCollection;
use App\Entity\RaceMedia as RaceMediaEntity;
use App\State\RaceMediaProcessor;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[ApiResource(
    shortName: 'RaceMedia',
    stateOptions: new Options(entityClass: RaceMediaEntity::class),
    operations: [
        new Get(),
        new GetCollection(
            output: RaceMediaCollection::class,
        ),
        new Post(
            inputFormats: ['multipart' => ['multipart/form-data']],
            openapi: new Model\Operation(
                requestBody: new Model\RequestBody(
                    content: new \ArrayObject([
                        'multipart/form-data' => [
                            'schema' => [
                                'type' => 'object',
                                'properties' => [
                                    'file' => [
                                        'type' => 'string',
                                        'format' => 'binary',
                                    ],
                                    'runner' => [
                                        'type' => 'string',
                                        'description' => 'IRI of the runner (User)',
                                    ],
                                ],
                                'required' => ['file', 'runner'],
                            ],
                        ],
                    ])
                )
            ),
            processor: RaceMediaProcessor::class,
            deserialize: false,
            read: false,
        ),
        new Delete(
            security: 'is_granted("ROLE_ADMIN")',
        ),
    ],
)]
#[Map(source: RaceMediaEntity::class)]
#[ApiFilter(SearchFilter::class, properties: ['id' => 'exact', 'runner.id' => 'exact'])]
#[ApiFilter(OrderFilter::class, properties: ['id', 'createdAt'])]
final class RaceMedia
{
    public ?int $id = null;

    #[Map(source: 'filePath')]
    public ?string $filePath = null;

    public ?string $runner = null;

    public ?\DateTimeInterface $createdAt = null;
}
