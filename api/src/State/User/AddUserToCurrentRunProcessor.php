<?php

namespace App\State\User;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\User\UserApi;
use App\Entity\Participation;
use App\Repository\RunRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\ObjectMapper\ObjectMapperInterface;

/** @implements ProcessorInterface<object, UserApi> */
final readonly class AddUserToCurrentRunProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserRepository $userRepository,
        private RunRepository $runRepository,
        private ObjectMapperInterface $objectMapper,
    ) {
    }

    /**
     * @param array<string, mixed> $uriVariables
     * @param array<string, mixed> $context
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): UserApi
    {
        $userId = (int) ($uriVariables['id'] ?? 0);
        $user = $this->userRepository->find($userId);
        if (null === $user) {
            throw new NotFoundHttpException("Utilisateur #$userId introuvable");
        }

        $run = $this->runRepository->findCurrentRun();
        if (null === $run) {
            throw new ConflictHttpException('Aucune édition de course disponible.');
        }

        $alreadyParticipating = false;
        foreach ($user->getParticipations() as $participation) {
            if ($participation->getRun()->getId() === $run->getId()) {
                $alreadyParticipating = true;
                break;
            }
        }

        if (!$alreadyParticipating) {
            $participation = new Participation();
            $participation->setUser($user);
            $participation->setRun($run);
            $this->em->persist($participation);
            $this->em->flush();
            $this->em->refresh($user);
        }

        return $this->objectMapper->map($user, UserApi::class);
    }
}
