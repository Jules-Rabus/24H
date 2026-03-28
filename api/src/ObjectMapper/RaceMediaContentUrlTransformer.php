<?php

namespace App\ObjectMapper;

use App\Entity\RaceMedia;
use Symfony\Component\ObjectMapper\TransformCallableInterface;
use Vich\UploaderBundle\Storage\StorageInterface;

final class RaceMediaContentUrlTransformer implements TransformCallableInterface
{
    public function __construct(private readonly StorageInterface $storage)
    {
    }

    public function __invoke(mixed $value, object $source, ?object $target): ?string
    {
        if (!$source instanceof RaceMedia) {
            return null;
        }

        return $this->storage->resolveUri($source, 'file');
    }
}
