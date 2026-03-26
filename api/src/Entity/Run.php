<?php

namespace App\Entity;

use App\Entity\Traits\Timestampable;
use App\Repository\RunRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: RunRepository::class)]
class Run
{
    use Timestampable;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, unique: true)]
    #[Assert\NotNull]
    #[Assert\LessThan(propertyPath: 'endDate')]
    #[Assert\GreaterThanOrEqual('now')]
    private \DateTimeInterface $startDate;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, unique: true)]
    #[Assert\NotNull]
    #[Assert\GreaterThan(propertyPath: 'startDate')]
    #[Assert\GreaterThanOrEqual('now')]
    private \DateTimeInterface $endDate;

    /**
     * @var Collection<int, Participation>
     */
    #[ORM\OneToMany(mappedBy: 'run', targetEntity: Participation::class, cascade: ['persist', 'remove'])]
    private Collection $participations;

    public function __construct()
    {
        $this->participations = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStartDate(): \DateTimeInterface
    {
        return $this->startDate;
    }

    public function setStartDate(\DateTimeInterface $startDate): void
    {
        $this->startDate = $startDate instanceof \DateTimeImmutable
            ? \DateTime::createFromImmutable($startDate)
            : $startDate;
    }

    public function getEndDate(): \DateTimeInterface
    {
        return $this->endDate;
    }

    public function setEndDate(\DateTimeInterface $endDate): void
    {
        $this->endDate = $endDate instanceof \DateTimeImmutable
            ? \DateTime::createFromImmutable($endDate)
            : $endDate;
    }

    /**
     * @return Collection<int, Participation>
     */
    public function getParticipations(): Collection
    {
        return $this->participations;
    }

    public function addParticipation(Participation $participation): static
    {
        if (!$this->participations->contains($participation)) {
            $this->participations->add($participation);
            $participation->setRun($this);
        }

        return $this;
    }

    public function removeParticipation(Participation $participation): static
    {
        $this->participations->removeElement($participation);

        return $this;
    }

    public function getParticipantsCount(): int
    {
        return $this->participations->count();
    }

    public function getInProgressParticipantsCount(): int
    {
        return $this->participations->filter(fn ($p) => 'IN_PROGRESS' === $p->getStatus())->count();
    }

    public function getFinishedParticipantsCount(): int
    {
        return $this->participations->filter(fn ($p) => 'FINISHED' === $p->getStatus())->count();
    }

    public function isFinished(): bool
    {
        return $this->endDate < new \DateTimeImmutable();
    }
}
