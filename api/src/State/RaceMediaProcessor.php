<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\RaceMedia;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Symfony\Component\RateLimiter\RateLimiterFactory;

/**
 * @implements ProcessorInterface<null, RaceMedia>
 */
final readonly class RaceMediaProcessor implements ProcessorInterface
{
    private const ALLOWED_MIMES = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'image/heic', 'image/heif',
        'video/mp4', 'video/quicktime', 'video/webm',
    ];

    private const MAX_SIZE = 25 * 1024 * 1024; // 25 Mo

    private const CSRF_COOKIE = 'XSRF-TOKEN';

    /**
     * @param ProcessorInterface<RaceMedia, RaceMedia|void> $persistProcessor
     */
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
        // Symfony auto-wires "{name}Limiter" → the limiter declared as
        // `public_media_upload` in framework.yaml.
        private RateLimiterFactory $publicMediaUploadLimiter,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): RaceMedia
    {
        $request = $context['request'] ?? null;
        if (!$request instanceof Request) {
            throw new BadRequestException('Request is required');
        }

        // Anonymous upload by design — but rate-limited per browser. We key
        // on the XSRF-TOKEN cookie (always present, set by GET /csrf-token
        // before any upload) instead of the IP, so users sharing an event
        // wifi NAT don't burn each other's quota.
        $key = $request->cookies->get(self::CSRF_COOKIE);
        if (!$key) {
            // No CSRF cookie at all — the request would already be rejected
            // by CsrfTokenSubscriber, but be defensive.
            throw new BadRequestException('Session cookie manquant.');
        }
        $limit = $this->publicMediaUploadLimiter->create($key)->consume(1);
        if (!$limit->isAccepted()) {
            throw new TooManyRequestsHttpException($limit->getRetryAfter()->getTimestamp() - time(), 'Trop de photos partagées dans la dernière heure. Réessayez plus tard.');
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
            throw new BadRequestException(sprintf('Format non supporté (%s). Formats acceptés : JPEG, PNG, WebP, GIF, HEIC, HEIF, MP4, MOV, WebM.', $mime ?? 'inconnu'));
        }

        $raceMedia = new RaceMedia();
        $raceMedia->setFile($file);
        $raceMedia->comment = $request->request->get('comment') ?: null;
        // contentType is populated automatically by VichUploader via mimeType mapping

        return $this->persistProcessor->process($raceMedia, $operation, $uriVariables, $context);
    }
}
