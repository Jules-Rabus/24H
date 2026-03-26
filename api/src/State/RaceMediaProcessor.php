<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\RaceMedia\RaceMediaApi;
use App\Entity\RaceMedia;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\ObjectMapper\ObjectMapperInterface;

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

        $entity = $this->persistProcessor->process($raceMedia, $operation, $uriVariables, $context);

        return $this->objectMapper->map($entity, RaceMediaApi::class);
    }
}
