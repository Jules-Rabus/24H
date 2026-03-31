<?php

namespace App\ApiResource\User;

use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\State\Options;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Controller\SecurityController;
use App\Dto\User\CreateUser;
use App\Dto\User\UpdateUser;
use App\Dto\User\UserCollection;
use App\Entity\User;
use App\ObjectMapper\ParticipationCollectionTransformer;
use App\ObjectMapper\UserImageUrlTransformer;
use App\State\User\CurrentUserProvider;
use App\State\UserProcessor;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[ApiResource(
    shortName: 'User',
    operations: [
        new Get(
            requirements: ['id' => '\d+'],
            security: 'is_granted("ROLE_ADMIN") or is_granted("USER_VIEW", object)',
        ),
        new Get(
            uriTemplate: '/me',
            provider: CurrentUserProvider::class,
            security: "is_granted('ROLE_USER')",
            name: 'me',
        ),
        new GetCollection(security: 'is_granted("ROLE_ADMIN")'),
        new GetCollection(
            uriTemplate: 'users/public',
            output: UserCollection::class,
            cacheHeaders: ['max_age' => 60, 'shared_max_age' => 60, 'public' => true],
        ),
        new Get(
            uriTemplate: 'users/public/{id}',
            output: UserCollection::class,
            cacheHeaders: ['max_age' => 60, 'shared_max_age' => 60, 'public' => true],
        ),
        new Post(
            uriTemplate: '/logout',
            controller: SecurityController::class.'::logout',
            read: false,
            deserialize: false,
            write: false,
            name: 'logout',
        ),
        new Post(
            security: 'is_granted("ROLE_ADMIN")',
            input: CreateUser::class,
            processor: UserProcessor::class,
        ),
        new Patch(
            security: 'is_granted("ROLE_ADMIN")',
            input: UpdateUser::class,
            processor: UserProcessor::class,
        ),
        new Delete(security: 'is_granted("ROLE_ADMIN")'),
    ],
    stateOptions: new Options(entityClass: User::class),
)]
#[Map(source: User::class)]
#[ApiFilter(SearchFilter::class, properties: ['id' => 'exact', 'firstName' => 'istart', 'lastName' => 'istart', 'surname' => 'istart', 'email' => 'istart', 'organization' => 'istart'])]
#[ApiFilter(OrderFilter::class, properties: ['id', 'firstName', 'lastName', 'surname', 'email', 'organization'])]
final class UserApi
{
    #[ApiProperty(iris: ['https://schema.org/identifier'])]
    public ?int $id = null;

    #[ApiProperty(iris: ['https://schema.org/givenName'])]
    public string $firstName;

    #[ApiProperty(iris: ['https://schema.org/familyName'])]
    public string $lastName;

    #[ApiProperty(iris: ['https://schema.org/familyName'])]
    public ?string $surname = null;

    #[ApiProperty(iris: ['https://schema.org/email'])]
    public ?string $email = null;

    /** @var list<string> */
    public array $roles = [];

    #[ApiProperty(iris: ['https://schema.org/Organization'])]
    public ?string $organization = null;

    /** @var list<int> */
    #[Map(transform: ParticipationCollectionTransformer::class)]
    public array $participations = [];

    #[Map(transform: UserImageUrlTransformer::class)]
    public ?string $image = null;

    public ?\DateTimeInterface $createdAt = null;

    public ?\DateTimeInterface $updatedAt = null;

    /** @var list<int> */
    #[Map(source: 'finishedParticipations', transform: ParticipationCollectionTransformer::class)]
    public array $finishedParticipations = [];

    #[Map(source: 'finishedParticipationsCount')]
    public int $finishedParticipationsCount = 0;
}
