<?php

namespace App\ObjectMapper;

use App\Entity\Medias;
use App\Entity\User;
use Symfony\Component\ObjectMapper\TransformCallableInterface;
use Vich\UploaderBundle\Storage\StorageInterface;

final class UserImageUrlTransformer implements TransformCallableInterface
{
    public function __construct(private readonly StorageInterface $storage)
    {
    }

    public function __invoke(mixed $value, object $source, ?object $target): ?string
    {
        if (!$source instanceof User) {
            return null;
        }

        $image = $source->getImage();
        if (!$image instanceof Medias) {
            return null;
        }

        return $this->storage->resolveUri($image, 'file');
    }
}
