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
#[ORM\HasLifecycleCallbacks]
class Run
{
    use Timestampable;
    public const string VALIDATION_GROUP_DELETE = 'Run:delete';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, unique: true)]
    #[Assert\NotNull]
    #[Assert\LessThan(propertyPath: 'endDate')]
    #[Assert\GreaterThanOrEqual('now')]
    #[Assert\GreaterThan(
        'now',
        message: 'Impossible de supprimer un run qui a déjà démarré ou qui est terminé.',
        groups: [self::VALIDATION_GROUP_DELETE],
    )]
    private \DateTimeInterface $startDate;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, unique: true)]
    #[Assert\NotNull]
    #[Assert\GreaterThan(propertyPath: 'startDate')]
    #[Assert\GreaterThanOrEqual('now')]
    private \DateTimeInterface $endDate;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $edition = null;

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

    #[ORM\PrePersist]
    #[ORM\PreUpdate]
    public function syncEditionFromStartDate(): void
    {
        $this->edition = (int) $this->startDate->format('Y');
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

    public function getEdition(): ?int
    {
        return $this->edition;
    }

    public function setEdition(?int $edition): void
    {
        $this->edition = $edition;
    }

    public function getFinishedParticipantsCount(): int
    {
        return $this->participations->filter(fn ($p) => 'FINISHED' === $p->getStatus())->count();
    }

    public function getAverageTime(): ?int
    {
        $finished = $this->participations->filter(fn ($p) => 'FINISHED' === $p->getStatus() && null !== $p->getTotalTime());
        if ($finished->isEmpty()) {
            return null;
        }
        $total = 0;
        foreach ($finished as $p) {
            $total += $p->getTotalTime();
        }

        return (int) round($total / $finished->count());
    }

    public function getFastestTime(): ?int
    {
        $times = $this->participations
            ->filter(fn ($p) => 'FINISHED' === $p->getStatus() && null !== $p->getTotalTime())
            ->map(fn ($p) => $p->getTotalTime())
            ->toArray();

        return $times ? min($times) : null;
    }

    public function isFinished(): bool
    {
        return $this->endDate < new \DateTimeImmutable();
    }
}
