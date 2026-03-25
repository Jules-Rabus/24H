<?php

namespace App\Entity;

use CoopTilleuls\ForgotPasswordBundle\Entity\AbstractPasswordToken;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class PasswordToken extends AbstractPasswordToken
{
    #[ORM\Id]
    #[ORM\Column]
    #[ORM\GeneratedValue]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private User $user;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    /** @param User $user */
    public function setUser($user): static
    {
        $this->user = $user;

        return $this;
    }
}
