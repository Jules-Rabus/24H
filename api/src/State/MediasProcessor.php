<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Medias;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * @implements ProcessorInterface<null, Medias>
 */
final readonly class MediasProcessor implements ProcessorInterface
{
    private const ALLOWED_MIMES = [
        'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
    ];

    private const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo

    /**
     * @param ProcessorInterface<Medias, Medias|void> $processor
     */
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $processor,
        private EntityManagerInterface $entityManager,
        private RequestStack $requestStack,
    ) {
    }

    /**
     * @param array<string, mixed> $uriVariables
     * @param array<string, mixed> $context
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Medias
    {
        $userId = $uriVariables['userId'] ?? null;
        if (null === $userId) {
            throw new UnprocessableEntityHttpException('userId URI variable is missing.');
        }

        $user = $this->entityManager->getRepository(User::class)->find($userId);
        if (!$user instanceof User) {
            throw new NotFoundHttpException(sprintf('User "%s" not found.', $userId));
        }

        $request = $this->requestStack->getCurrentRequest();
        $file = $request?->files->get('file');
        if (null === $file) {
            throw new UnprocessableEntityHttpException('No file uploaded.');
        }

        if ($file->getSize() > self::MAX_SIZE) {
            throw new UnprocessableEntityHttpException('La photo ne doit pas dépasser 10 Mo.');
        }

        $mime = $file->getMimeType();
        if (!in_array($mime, self::ALLOWED_MIMES, true)) {
            throw new UnprocessableEntityHttpException(sprintf('Format non supporté (%s). Formats acceptés : JPEG, PNG, WebP, HEIC, HEIF.', $mime ?? 'inconnu'));
        }

        // Reuse existing Medias entity if user already has one, otherwise create new
        $entity = $user->getImage() ?? new Medias();
        $entity->setRunner($user);
        $entity->setFile($file);

        return $this->processor->process($entity, $operation, $uriVariables, $context);
    }
}
