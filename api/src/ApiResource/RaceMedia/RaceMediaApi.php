<?php

namespace App\ApiResource\RaceMedia;

use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\State\Options;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\OpenApi\Model;
use App\Dto\RaceMedia\RaceMediaCollection;
use App\Entity\RaceMedia;
use App\ObjectMapper\RaceMediaContentUrlTransformer;
use App\State\RaceMediaLikeProcessor;
use App\State\RaceMediaProcessor;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[ApiResource(
    shortName: 'RaceMedia',
    uriTemplate: '/race_medias',
    stateOptions: new Options(entityClass: RaceMedia::class),
    mercure: true,
    operations: [
        new Get(uriTemplate: '/race_medias/{id}'),
        new GetCollection(
            uriTemplate: '/race_medias',
            output: RaceMediaCollection::class,
        ),
        new Post(
            uriTemplate: '/race_medias',
            security: 'is_granted("ROLE_ADMIN")',
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
                                    'comment' => [
                                        'type' => 'string',
                                        'nullable' => true,
                                    ],
                                ],
                                'required' => ['file'],
                            ],
                        ],
                    ])
                )
            ),
            processor: RaceMediaProcessor::class,
            output: RaceMediaApi::class,
            deserialize: false,
            read: false,
        ),
        new Delete(
            uriTemplate: '/race_medias/{id}',
            security: 'is_granted("ROLE_ADMIN")',
        ),
        new Post(
            uriTemplate: '/race_medias/{id}/like',
            processor: RaceMediaLikeProcessor::class,
            deserialize: false,
            read: false,
            name: 'race_media_like',
        ),
    ],
)]
#[Map(source: RaceMedia::class)]
#[ApiFilter(SearchFilter::class, properties: ['id' => 'exact'])]
#[ApiFilter(OrderFilter::class, properties: ['id', 'createdAt'])]
final class RaceMediaApi
{
    public ?int $id = null;

    #[ApiProperty(readable: true)]
    #[Map(source: 'filePath', transform: RaceMediaContentUrlTransformer::class)]
    public ?string $contentUrl = null;

    public ?string $comment = null;

    public int $likesCount = 0;

    public ?string $contentType = null;

    public ?\DateTimeInterface $createdAt = null;
}
