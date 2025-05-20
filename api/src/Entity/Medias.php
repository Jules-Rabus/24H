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
use ApiPlatform\Metadata\Post;
use ApiPlatform\OpenApi\Model;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Vich\UploaderBundle\Mapping\Annotation as Vich;

#[Vich\Uploadable]
#[ORM\Entity]
#[ApiResource(
    operations: [
        new Get(),
        new GetCollection(
            security: self::ADMIN,
        ),
        new Post(
            inputFormats: ['multipart' => ['multipart/form-data']],
            openapi: new Model\Operation(
                requestBody: new Model\RequestBody(
                    content: new \ArrayObject([
                        'multipart/form-data' => [
                            'schema' => [
                                'type' => 'object',
                                'properties' => [
                                    'file' => [
                                        'type' => 'string',
                                        'format' => 'binary'
                                    ],
                                    'runner' => [
                                        'type' => 'string',
                                        'format' => 'iri-reference'
                                    ]
                                ]
                            ]
                        ]
                    ])
                )
            ),
            security: self::ADMIN,
        ),
        new Delete(
            security: self::ADMIN,
        ),
    ],
    normalizationContext: ['groups' => [self::READ]],
    denormalizationContext: ['groups' => [self::WRITE]],
)]
class Medias
{

    public const string READ = 'medias:read';
    public const string WRITE = 'medias:write';

    private const string ADMIN = 'is_granted("ROLE_ADMIN")';

    #[ORM\Id, ORM\Column, ORM\GeneratedValue]
    #[ApiFilter(SearchFilter::class, strategy: "exact")]
    #[ApiFilter(OrderFilter::class)]
    private ?int $id = null;

    #[Vich\UploadableField(mapping: 'users', fileNameProperty: 'filePath')]
    #[Groups([self::WRITE])]
    public ?File $file = null;

    #[ApiProperty(writable: false)]
    #[ORM\Column(nullable: true)]
    #[Groups([self::READ])]
    public ?string $filePath = null;

    #[ORM\OneToOne(mappedBy: 'image', cascade: ['persist', 'remove'])]
    #[Assert\NotNull]
    #[Groups([self::READ, self::WRITE])]
    #[ApiFilter(SearchFilter::class, properties: ["user" => "exact", "user.id" => "exact", "user.firstName" => "istart", "user.lastName" => "istart", "user.surname" => "istart"])]
    private User $runner;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFile(): ?File
    {
        return $this->file;
    }

    public function setFile(?File $file): void
    {
        $this->file = $file;
    }

    public function getFilePath(): ?string
    {
        return 'https://localhost/images/users/' . $this->filePath;
    }

    public function setFilePath(?string $filePath): void
    {
        $this->filePath = $filePath;
    }

    public function getRunner(): User
    {
        return $this->runner;
    }

    public function setRunner(User $runner): static
    {
        // unset the owning side of the relation if necessary
        if ($runner === null && $this->runner !== null) {
            $this->runner->setImage(null);
        }

        // set the owning side of the relation if necessary
        if ($runner !== null && $runner->getImage() !== $this) {
            $runner->setImage($this);
        }

        $this->runner = $runner;

        return $this;
    }
}
