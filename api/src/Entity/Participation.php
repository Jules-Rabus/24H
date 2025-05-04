<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\GetCollection;
use App\Repository\ParticipationRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;

#[ORM\Entity(repositoryClass: ParticipationRepository::class)]
#[ORM\Table(
    uniqueConstraints: [new ORM\UniqueConstraint(name: "uq_user_run", columns: ["user_id", "run_id"]) ]
)]
#[UniqueEntity(fields: ["user", "run"], message: "Un utilisateur ne peut participer qu'une seule fois au même run.")]
#[ApiResource(
    operations: [
        new GetCollection(
            paginationEnabled: true,
            paginationItemsPerPage: 50,
            paginationMaximumItemsPerPage: 1000,
            paginationClientItemsPerPage: true,
        ),
        new Get(),
        new Post(security: self::ADMIN),
        new Patch(security: self::ADMIN),
        new Delete(security: self::ADMIN),
    ],
    normalizationContext: ['groups' => [self::READ]],
    denormalizationContext: ['groups' => [self::WRITE]],
    mercure: true,
    security: self::ACCESS
)]
class Participation
{
    public const string READ = 'participation:read';
    public const string WRITE = 'participation:write';

    public const string ACCESS = 'is_granted("ROLE_ADMIN") or object.user == user';
    public const string ADMIN = 'is_granted("ROLE_ADMIN")';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups([self::READ])]
    #[ApiFilter(SearchFilter::class, strategy: "exact")]
    #[ApiFilter(OrderFilter::class)]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Run::class, inversedBy: 'participations')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups([self::READ, self::WRITE])]
    #[ApiFilter(SearchFilter::class, properties: ["run" => "exact", "run.id" => "exact"])]
    #[ApiFilter(DateFilter::class, properties: ["run.startDate", "run.endDate"])]
    private ?Run $run = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'participations')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups([self::READ, self::WRITE])]
    #[ApiFilter(SearchFilter::class, properties: ["user" => "exact", "user.id" => "exact", "user.firstName" => "istart", "user.lastName" => "istart", "user.surname" => "istart"])]
    private ?User $user = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    #[Groups([self::READ, self::WRITE])]
    #[ApiFilter(DateFilter::class)]
    #[ApiFilter(OrderFilter::class)]
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

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): void
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

    #[Groups([self::READ])]
    public function getStatus(): string
    {
        if($this->arrivalTime) {
            return 'FINISHED';
        }

        return 'IN_PROGRESS';
    }

}
