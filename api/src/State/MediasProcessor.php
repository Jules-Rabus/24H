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

        // Reuse existing Medias entity if user already has one, otherwise create new
        $entity = $user->getImage() ?? new Medias();
        $entity->setRunner($user);
        $entity->setFile($file);

        return $this->processor->process($entity, $operation, $uriVariables, $context);
    }
}
