<?php

namespace App\Dto\User;

use App\Entity\User;
use Symfony\Component\ObjectMapper\Attribute\Map;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Constraints\PasswordStrength;

#[Map(target: User::class)]
final class UpdateUser
{
    #[Assert\NotBlank(allowNull: true)]
    public ?string $firstName;

    #[Assert\NotBlank(allowNull: true)]
    public ?string $lastName;

    public ?string $surname;

    #[Assert\Email]
    public ?string $email;

    #[PasswordStrength(minScore: PasswordStrength::STRENGTH_WEAK)]
    public ?string $plainPassword;

    public ?string $organization;

    /** @var list<string>|null */
    public ?array $roles;
}
