<?php

namespace App\Api\Medias\Resource;

use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\State\Options;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Post;
use ApiPlatform\OpenApi\Model;
use App\Api\Medias\Dto\MediasCollection;
use App\Entity\Medias as MediasEntity;
use App\Entity\User as UserEntity;
use App\State\MediasProcessor;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[ApiResource(
    shortName: 'Medias',
    stateOptions: new Options(entityClass: MediasEntity::class),
    operations: [
        new Get(),
        new GetCollection(
            security: 'is_granted("ROLE_ADMIN")',
            output: MediasCollection::class,
        ),
        new Post(
            uriTemplate: '/users/{userId}/image',
            uriVariables: [
                'userId' => new Link(fromClass: UserEntity::class, identifiers: ['id']),
            ],
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
                                ],
                                'required' => ['file'],
                            ],
                        ],
                    ])
                )
            ),
            security: 'is_granted("ROLE_ADMIN")',
            processor: MediasProcessor::class,
            deserialize: false,
            read: false,
        ),
        new Delete(
            security: 'is_granted("ROLE_ADMIN")',
        ),
    ],
)]
#[Map(source: MediasEntity::class)]
#[ApiFilter(SearchFilter::class, properties: ['id' => 'exact'])]
#[ApiFilter(OrderFilter::class, properties: ['id'])]
final class Medias
{
    public ?int $id = null;

    #[Map(source: 'filePath')]
    public ?string $filePath = null;

    #[Map(if: false)]
    public ?string $runner = null;
}
