<?php

namespace App\Dto\User;

use App\Entity\User;
use App\ObjectMapper\UserImageUrlTransformer;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[Map(source: User::class)]
final class UserRef
{
    public int $id;

    public string $firstName;

    public string $lastName;

    public ?string $surname = null;

    #[Map(transform: UserImageUrlTransformer::class)]
    public ?string $image = null;
}
