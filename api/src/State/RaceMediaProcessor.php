<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\RaceMedia\RaceMediaApi;
use App\Entity\RaceMedia;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\ObjectMapper\ObjectMapperInterface;
use Vich\UploaderBundle\Storage\StorageInterface;

/**
 * @implements ProcessorInterface<null, RaceMediaApi>
 */
final readonly class RaceMediaProcessor implements ProcessorInterface
{
    /**
     * @param ProcessorInterface<RaceMedia, RaceMedia|void> $persistProcessor
     */
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
        private ObjectMapperInterface $objectMapper,
        private StorageInterface $storage,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): RaceMediaApi
    {
        $request = $context['request'] ?? null;
        $file = $request?->files->get('file');
        if (!$file) {
            throw new BadRequestException('File is required');
        }

        $raceMedia = new RaceMedia();
        $raceMedia->setFile($file);
        $raceMedia->comment = $request?->request->get('comment') ?: null;

        $entity = $this->persistProcessor->process($raceMedia, $operation, $uriVariables, $context);

        $resource = $this->objectMapper->map($entity, RaceMediaApi::class);
        // Build full public URL via VichUploader storage
        $resource->contentUrl = $this->storage->resolveUri($entity, 'file');

        return $resource;
    }
}
