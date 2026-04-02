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
    private const ALLOWED_MIMES = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/quicktime', 'video/webm',
    ];

    private const MAX_SIZE = 25 * 1024 * 1024; // 25 Mo

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

        if ($file->getSize() > self::MAX_SIZE) {
            throw new BadRequestException('Le fichier ne doit pas dépasser 25 Mo.');
        }

        $mime = $file->getMimeType();
        if (!in_array($mime, self::ALLOWED_MIMES, true)) {
            throw new BadRequestException(sprintf('Format non supporté (%s). Formats acceptés : JPEG, PNG, WebP, GIF, MP4, MOV, WebM.', $mime ?? 'inconnu'));
        }

        $raceMedia = new RaceMedia();
        $raceMedia->setFile($file);
        $raceMedia->comment = $request->request->get('comment') ?: null;
        // contentType is populated automatically by VichUploader via mimeType mapping

        return $this->persistProcessor->process($raceMedia, $operation, $uriVariables, $context);
    }
}
