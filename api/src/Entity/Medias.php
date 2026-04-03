<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\File;
use Vich\UploaderBundle\Mapping\Annotation as Vich;

#[Vich\Uploadable]
#[ORM\Entity]
class Medias
{
    #[ORM\Id, ORM\Column, ORM\GeneratedValue]
    private ?int $id = null;

    #[Vich\UploadableField(mapping: 'users', fileNameProperty: 'filePath')]
    public ?File $file = null;

    #[ORM\Column(nullable: true)]
    public ?string $filePath = null;

    #[ORM\OneToOne(mappedBy: 'image')]
    private ?User $runner = null;

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
        return $this->filePath;
    }

    public function setFilePath(?string $filePath): void
    {
        $this->filePath = $filePath;
    }

    public function getRunner(): ?User
    {
        return $this->runner;
    }

    public function setRunner(?User $runner): static
    {
        if (null === $runner && null !== $this->runner) {
            $this->runner->setImage(null);
        }

        if (null !== $runner && $runner->getImage() !== $this) {
            $runner->setImage($this);
        }

        $this->runner = $runner;

        return $this;
    }
}
