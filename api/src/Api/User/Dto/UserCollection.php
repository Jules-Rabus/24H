<?php

namespace App\Api\User\Dto;

use App\Entity\User as UserEntity;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[Map(source: UserEntity::class)]
final class UserCollection
{
    public int $id;

    public string $firstName;

    public string $lastName;

    public ?string $surname = null;

    public ?string $email = null;

    public ?string $organization = null;

    public ?string $image = null;

    /** @var list<string> */
    public array $participations = [];

    #[Map(source: 'finishedParticipationsCount')]
    public int $finishedParticipationsCount = 0;
}
