<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\RaceMedia;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpFoundation\Request;

/**
 * @implements ProcessorInterface<null, RaceMedia>
 */
final readonly class RaceMediaProcessor implements ProcessorInterface
{
    /**
     * @param ProcessorInterface<RaceMedia, RaceMedia|void> $persistProcessor
     */
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): RaceMedia
    {
        $request = $context['request'] ?? null;
        if (!$request instanceof Request) {
            throw new BadRequestException('Request is required');
        }

        $file = $request->files->get('file');
        if (!$file) {
            throw new BadRequestException('File is required');
        }

        $raceMedia = new RaceMedia();
        $raceMedia->setFile($file);
        $raceMedia->comment = $request->request->get('comment') ?: null;

        return $this->persistProcessor->process($raceMedia, $operation, $uriVariables, $context);
    }
}
