<?php

namespace App\Dto\User;

use App\Entity\User;
use App\ObjectMapper\ParticipationCollectionTransformer;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[Map(source: User::class)]
final class UserCollection
{
    public int $id;

    public string $firstName;

    public string $lastName;

    public ?string $surname = null;

    public ?string $email = null;

    public ?string $organization = null;

    public ?string $image = null;

    /** @var list<int> */
    #[Map(transform: ParticipationCollectionTransformer::class)]
    public array $participations = [];

    #[Map(source: 'finishedParticipationsCount')]
    public int $finishedParticipationsCount = 0;
}
