<?php

namespace App\Entity;

use App\Entity\Traits\Timestampable;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\Validator\Constraints as Assert;
use Vich\UploaderBundle\Mapping\Annotation as Vich;

#[Vich\Uploadable]
#[ORM\Entity]
class RaceMedia
{
    use Timestampable;

    #[ORM\Id, ORM\Column, ORM\GeneratedValue]
    private ?int $id = null;

    #[Assert\File(
        maxSize: '25M',
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'video/mp4', 'video/quicktime', 'video/webm'],
        maxSizeMessage: 'Le fichier ne doit pas dépasser 25 Mo.',
        mimeTypesMessage: 'Format non supporté. Formats acceptés : JPEG, PNG, WebP, GIF, HEIC, HEIF, MP4, MOV, WebM.',
    )]
    #[Vich\UploadableField(mapping: 'race_media', fileNameProperty: 'filePath', mimeType: 'contentType')]
    public ?File $file = null;

    #[ORM\Column(nullable: true)]
    public ?string $filePath = null;

    #[ORM\Column(type: 'text', nullable: true)]
    public ?string $comment = null;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    public int $likesCount = 0;

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    public ?string $contentType = null;

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
}
