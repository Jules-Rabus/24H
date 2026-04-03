<?php

namespace App\ApiResource\Medias;

use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\State\Options;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Post;
use ApiPlatform\OpenApi\Model;
use App\Dto\Medias\MediasCollection;
use App\Entity\Medias;
use App\Entity\User;
use App\ObjectMapper\MediasContentUrlTransformer;
use App\State\MediasDeleteProcessor;
use App\State\MediasProcessor;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[ApiResource(
    shortName: 'Medias',
    stateOptions: new Options(entityClass: Medias::class),
    operations: [
        new Get(),
        new GetCollection(
            security: 'is_granted("ROLE_ADMIN")',
            output: MediasCollection::class,
        ),
        new Post(
            uriTemplate: '/users/{userId}/image',
            uriVariables: [
                'userId' => new Link(fromClass: User::class, identifiers: ['id']),
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
            output: MediasApi::class,
            deserialize: false,
            read: false,
        ),
        new Delete(
            security: 'is_granted("ROLE_ADMIN")',
            processor: MediasDeleteProcessor::class,
        ),
        new Delete(
            uriTemplate: '/users/{userId}/image',
            uriVariables: [
                'userId' => new Link(fromClass: User::class, identifiers: ['id']),
            ],
            security: 'is_granted("ROLE_ADMIN")',
            processor: MediasDeleteProcessor::class,
            read: false,
        ),
    ],
)]
#[Map(source: Medias::class)]
#[ApiFilter(SearchFilter::class, properties: ['id' => 'exact'])]
#[ApiFilter(OrderFilter::class, properties: ['id'])]
final class MediasApi
{
    public ?int $id = null;

    #[ApiProperty(readable: true)]
    #[Map(source: 'filePath', transform: MediasContentUrlTransformer::class)]
    public ?string $contentUrl = null;

    #[Map(if: false)]
    public ?string $runner = null;
}
