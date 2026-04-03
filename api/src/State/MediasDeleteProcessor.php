<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Medias;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * @implements ProcessorInterface<Medias|null, null>
 */
final readonly class MediasDeleteProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {
    }

    /**
     * @param array<string, mixed> $uriVariables
     * @param array<string, mixed> $context
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): null
    {
        $userId = $uriVariables['userId'] ?? null;

        if (null !== $userId) {
            // DELETE /users/{userId}/image — find image via user
            $user = $this->entityManager->getRepository(User::class)->find($userId);
            if (!$user instanceof User) {
                throw new NotFoundHttpException(sprintf('User "%s" not found.', $userId));
            }
            $image = $user->getImage();
        } else {
            // DELETE /medias/{id} — $data is the Medias entity loaded by API Platform
            $image = $data;
        }

        if (null !== $image) {
            $runner = $image->getRunner();
            if (null !== $runner) {
                $runner->setImage(null);
                $this->entityManager->flush();
            }
            $this->entityManager->remove($image);
            $this->entityManager->flush();
        }

        return null;
    }
}
