<?php

namespace App\Serializer;

use App\Api\Medias\Resource\Medias as MediasResource;
use App\Entity\Medias as MediasEntity;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerAwareInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerAwareTrait;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Vich\UploaderBundle\Storage\StorageInterface;

/**
 * Enriches the serialized Medias resource DTO with the full public URL
 * built by VichUploader (works with any storage: local, S3/RustFS, etc.).
 */
final class MediasNormalizer implements NormalizerInterface, NormalizerAwareInterface
{
    use NormalizerAwareTrait;

    private const string ALREADY_CALLED = 'MEDIAS_NORMALIZER_ALREADY_CALLED';

    public function __construct(
        private readonly StorageInterface $storage,
        private readonly EntityManagerInterface $entityManager,
    ) {
    }

    public function normalize(mixed $object, ?string $format = null, array $context = []): array
    {
        $context[self::ALREADY_CALLED] = true;
        $data = $this->normalizer->normalize($object, $format, $context);

        /** @var MediasResource $object */
        if (null !== $object->id) {
            $entity = $this->entityManager->find(MediasEntity::class, $object->id);
            if ($entity instanceof MediasEntity && null !== $entity->filePath) {
                $data['filePath'] = $this->storage->resolveUri($entity, 'file');
            }
        }

        return $data;
    }

    public function supportsNormalization(mixed $data, ?string $format = null, array $context = []): bool
    {
        if (isset($context[self::ALREADY_CALLED])) {
            return false;
        }

        return $data instanceof MediasResource;
    }

    public function getSupportedTypes(?string $format): array
    {
        return [MediasResource::class => false];
    }
}
