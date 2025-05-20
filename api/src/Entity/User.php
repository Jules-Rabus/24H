<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Entity\Traits\Timestampable;
use App\Repository\UserRepository;
use App\State\UserProcessor;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Constraints\PasswordStrength;

#[ApiResource(
    operations: [
        new GetCollection(security: self::ADMIN),
        new GetCollection(
            uriTemplate: 'users/public',
            normalizationContext: ['groups' => [self::PUBLIC_READ]],
        ),
        new Get(security: self::ACCESS),
        new Get(
            uriTemplate: 'users/public/{id}',
            normalizationContext: ['groups' => [self::PUBLIC_READ]],
        ),
        new Post(security: self::ADMIN, validationContext: ['groups' => ['Default', self::WRITE]], processor: UserProcessor::class),
        new Patch(security: self::ADMIN, processor: UserProcessor::class),
        new Delete(security: self::ADMIN),
    ],
    normalizationContext: ['groups' => [self::READ]],
    denormalizationContext: ['groups' => [self::WRITE]],
)]
#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{

    use Timestampable;

    public const string READ = 'user:read';
    public const string PUBLIC_READ = 'user:public:read';
    public const string WRITE = 'user:write';
    private const string ACCESS = 'is_granted("ROLE_ADMIN") or object == user';
    private const string ADMIN = 'is_granted("ROLE_ADMIN")';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups([self::READ, self::PUBLIC_READ])]
    #[ApiFilter(SearchFilter::class, strategy: "exact")]
    #[ApiFilter(OrderFilter::class)]
    #[ApiProperty(iris: ["https://schema.org/identifier"])]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    #[Groups([self::READ, self::PUBLIC_READ, self::WRITE, Run::READ, Participation::READ, Medias::READ])]
    #[Assert\NotBlank]
    #[ApiFilter(SearchFilter::class, strategy: "istart")]
    #[ApiFilter(OrderFilter::class)]
    #[ApiProperty(iris: ["https://schema.org/givenName"])]
    private string $firstName;

    #[ORM\Column(length: 180)]
    #[Groups([self::READ, self::PUBLIC_READ, self::WRITE, Run::READ, Participation::READ, Medias::READ])]
    #[Assert\NotBlank]
    #[ApiFilter(SearchFilter::class, strategy: "istart")]
    #[ApiFilter(OrderFilter::class)]
    #[ApiProperty(iris: ["https://schema.org/familyName"])]
    private string $lastName;

    #[ORM\Column(length: 180, nullable: true)]
    #[Groups([self::READ, self::PUBLIC_READ, self::WRITE, Run::READ, Participation::READ, Medias::READ])]
    #[ApiFilter(SearchFilter::class, strategy: "istart")]
    #[ApiFilter(OrderFilter::class)]
    #[ApiProperty(iris: ["https://schema.org/familyName"])]
    private ?string $surname;

    #[ORM\Column(length: 180, unique: true, nullable: true)]
    #[Groups([self::READ, self::WRITE])]
    #[Assert\Email]
    #[ApiFilter(SearchFilter::class, strategy: "istart")]
    #[ApiFilter(OrderFilter::class)]
    #[ApiProperty(iris: ["https://schema.org/email"])]
    private ?string $email = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    #[Groups([self::READ, self::WRITE])]
    private array $roles = [];

    /**
     * @var string|null The hashed password
     */
    #[ORM\Column(nullable: true)]
    private ?string $password = null;

    #[Groups([self::WRITE])]
    #[PasswordStrength([
        'minScore' => PasswordStrength::STRENGTH_WEAK,
    ])]
    private ?string $plainPassword = null;

    #[ORM\Column(length: 180, nullable: true)]
    #[Groups([self::READ, self::PUBLIC_READ, self::WRITE])]
    #[ApiFilter(SearchFilter::class, strategy: "istart")]
    #[ApiFilter(OrderFilter::class)]
    #[ApiProperty(iris: ["https://schema.org/Organization"])]
    private ?string $organization = null;

    /**
     * @var Collection<int, Participation>
     */
    #[ORM\OneToMany(targetEntity: Participation::class, mappedBy: 'user', orphanRemoval: true)]
    #[Groups([self::READ, self::PUBLIC_READ, self::WRITE])]
    private Collection $participations;

    #[ORM\OneToOne(inversedBy: 'runner', cascade: ['persist', 'remove'])]
    #[Groups([self::READ, self::PUBLIC_READ])]
    private ?Medias $image = null;

    public function __construct()
    {
        $this->participations = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFirstName(): string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): void
    {
        $this->firstName = $firstName;
    }

    public function getLastName(): string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): void
    {
        $this->lastName = $lastName;
    }

    public function getSurname(): ?string
    {
        return $this->surname;
    }

    public function setSurname(?string $surname): void
    {
        $this->surname = $surname;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @return list<string>
     *
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    public function setPlainPassword(?string $plainPassword): self
    {
        $this->plainPassword = $plainPassword;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function getOrganization(): ?string
    {
        return $this->organization;
    }

    public function setOrganization(?string $organization): void
    {
        $this->organization = $organization;
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
            $participation->setUser($this);
        }

        return $this;
    }

    public function removeParticipation(Participation $participation): static
    {
        if ($this->participations->removeElement($participation)) {
            // set the owning side to null (unless already changed)
            if ($participation->getUser() === $this) {
                $participation->setUser(null);
            }
        }

        return $this;
    }

    #[Groups([self::READ])]
    public function getFinishedParticipations(): Collection
    {
        return $this->participations->filter(function(Participation $participation) {
            return $participation->getArrivalTime() !== null;
        });
    }

    #[Groups([self::READ, Participation::READ])]
    public function getFinishedParticipationsCount(): int
    {
        return $this->getFinishedParticipations()->count();
    }

    public function getImage(): ?Medias
    {
        return $this->image;
    }

    public function setImage(?Medias $image): static
    {
        $this->image = $image;

        return $this;
    }
}
