<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Entity\Traits\Timestampable;
use App\Repository\RunRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiFilter(DateFilter::class, properties: ['startDate', 'endDate'])]
#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
        new Post(
            denormalizationContext: ['groups' => ['Default', self::WRITE]],
        ),
        new Patch(),
        new Delete()
    ],
    normalizationContext: ['groups' => [self::READ]],
    denormalizationContext: ['groups' => [self::WRITE]],
    security: self::ADMIN
)]
#[ORM\Entity(repositoryClass: RunRepository::class)]
class Run
{
    use Timestampable;

    public const string READ = 'reservation:read';
    public const string WRITE = 'reservation:write';
    public const string ADMIN = 'is_granted("ROLE_ADMIN")';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups([self::READ])]
    #[ApiFilter(SearchFilter::class, strategy: "exact")]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, unique: true)]
    #[Assert\NotNull]
    #[Assert\LessThan(propertyPath: 'endDate')]
    #[Assert\GreaterThanOrEqual('now')]
    #[ApiFilter(DateFilter::class)]
    #[ApiFilter(OrderFilter::class)]
    #[Groups([self::READ, self::WRITE])]
    private \DateTimeInterface $startDate;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, unique: true)]
    #[Assert\NotNull]
    #[Assert\GreaterThan(propertyPath: 'startDate')]
    #[Assert\GreaterThanOrEqual('now')]
    #[ApiFilter(DateFilter::class)]
    #[ApiFilter(OrderFilter::class)]
    #[Groups([self::READ, self::WRITE])]
    private \DateTimeInterface $endDate;

    /**
     * @var Collection<int, Participation>
     */
    #[ORM\OneToMany(mappedBy: 'run', targetEntity: Participation::class, cascade: ['persist', 'remove'])]
    #[Groups([self::READ, self::WRITE])]
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
        $this->startDate = $startDate;
    }

    public function getEndDate(): \DateTimeInterface
    {
        return $this->endDate;
    }

    public function setEndDate(\DateTimeInterface $endDate): void
    {
        $this->endDate = $endDate;
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

    #[Groups([self::READ])]
    public function getParticipantsCount(): int
    {
        return $this->participations->count();
    }

    #[Groups([self::READ])]
    public function getInProgressParticipantsCount(): int
    {
        return $this->participations->filter(fn($p) => $p->getStatus() === 'IN_PROGRESS')->count();
    }

    #[Groups([self::READ])]
    public function getFinishedParticipantsCount(): int
    {
        return $this->participations->filter(fn($p) => $p->getStatus() === 'FINISHED')->count();
    }

    public function isFinished(): bool
    {
        return $this->endDate < new \DateTimeImmutable();
    }
}
