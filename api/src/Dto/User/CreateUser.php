<?php

namespace App\Dto\User;

use App\Entity\User;
use Symfony\Component\ObjectMapper\Attribute\Map;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Constraints\PasswordStrength;

#[Map(target: User::class)]
final class CreateUser
{
    #[Assert\NotBlank]
    public string $firstName;

    #[Assert\NotBlank]
    public string $lastName;

    public ?string $surname = null;

    #[Assert\Email]
    public ?string $email = null;

    #[PasswordStrength(minScore: PasswordStrength::STRENGTH_WEAK)]
    public ?string $plainPassword = null;

    public ?string $organization = null;

    /** @var list<string> */
    public array $roles = [];
}
