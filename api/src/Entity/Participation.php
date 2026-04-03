<?php

namespace App\Entity;

use App\Repository\ParticipationRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ParticipationRepository::class)]
#[ORM\UniqueConstraint(name: 'uq_user_run', columns: ['user_id', 'run_id'])]
#[UniqueEntity(fields: ['user', 'run'], message: "Un utilisateur ne peut participer qu'une seule fois au même run.")]
class Participation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Run::class, inversedBy: 'participations', cascade: ['persist'])]
    #[ORM\JoinColumn(nullable: false)]
    private ?Run $run = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'participations', cascade: ['persist'])]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    #[Assert\LessThanOrEqual('now')]
    #[Assert\GreaterThanOrEqual(propertyPath: 'run.startDate')]
    private ?\DateTimeInterface $arrivalTime = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getRun(): ?Run
    {
        return $this->run;
    }

    public function setRun(?Run $run): void
    {
        $this->run = $run;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): void
    {
        $this->user = $user;
    }

    public function getArrivalTime(): ?\DateTimeInterface
    {
        return $this->arrivalTime;
    }

    public function setArrivalTime(?\DateTimeInterface $arrivalTime): void
    {
        $this->arrivalTime = $arrivalTime;
    }

    public function getTotalTime(): ?int
    {
        if ($this->arrivalTime) {
            return $this->arrivalTime->getTimestamp() - $this->run->getStartDate()->getTimestamp();
        }

        return null;
    }

    public function getStatus(): string
    {
        if ($this->arrivalTime) {
            return 'FINISHED';
        }

        return 'IN_PROGRESS';
    }
}
