<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Entity\Traits\Timestampable;
use App\Enum\RunMessage;
use App\Repository\RunRepository;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiFilter(DateFilter::class, properties: ['startDate', 'endDate'])]
#[ApiResource(
    operations: [
        new GetCollection(
            paginationEnabled: true,
            paginationItemsPerPage: 25,
            paginationMaximumItemsPerPage: 1000,
            paginationClientItemsPerPage: true,
            security: self::ADMIN
        ),
        new Get(
            security: self::ACCESS
        ),
        new Post(
            denormalizationContext: ['groups' => [self::WRITE]],
        ),
        new Patch(
            security: self::ACCESS
        ),
        new Delete(
            security: self::ACCESS
        )
    ],
    normalizationContext: ['groups' => [self::READ]],
    denormalizationContext: ['groups' => [self::WRITE]],
    security: "is_granted('ROLE_USER')",
)]
#[ORM\Entity(repositoryClass: RunRepository::class)]
class Run
{
    use Timestampable;

    public const string READ = 'reservation:read';
    public const string WRITE = 'reservation:write';
    private const string ACCESS = 'is_granted("ROLE_ADMIN") or object == user';
    private const string ADMIN = 'is_granted("ROLE_ADMIN") or 1 == 1';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'uuid')]
    #[Groups([self::READ])]
    #[ApiFilter(SearchFilter::class, strategy: "exact")]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: false)]
    #[Assert\NotNull]
    #[Assert\LessThan('+1 hours')]
    #[Assert\LessThan(propertyPath: 'endDate')]
    #[Assert\GreaterThanOrEqual('now')]
    #[Groups([self::READ])]
    private \DateTimeInterface $startDate;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Assert\LessThan('+1 hours')]
    #[Assert\GreaterThan(propertyPath: 'startDate')]
    #[Assert\GreaterThanOrEqual('now')]
    #[Groups([self::READ])]
    private ?\DateTimeInterface $endDate = null;

    #[ORM\ManyToOne(inversedBy: 'runs')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $runner = null;

    #[Groups([self::WRITE])]
    private RunMessage $message;

    public function __construct()
    {
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

    public function getEndDate(): ?\DateTimeInterface
    {
        return $this->endDate;
    }

    public function setEndDate(?\DateTimeInterface $endDate): void
    {
        $this->endDate = $endDate;
    }

    public function getRunner(): ?User
    {
        return $this->runner;
    }

    public function setRunner(?User $runner): static
    {
        $this->runner = $runner;

        return $this;
    }

    public function getMessage(): RunMessage
    {
        return $this->message;
    }

    public function setMessage(RunMessage $message): void
    {
        $this->message = $message;
    }
}
