<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\User\UserApi;
use App\Dto\User\CreateUser;
use App\Dto\User\UpdateUser;
use App\Entity\Participation;
use App\Entity\User;
use App\Repository\RunRepository;
use App\Repository\UserRepository;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\ObjectMapper\ObjectMapperInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * @implements ProcessorInterface<CreateUser|UpdateUser, UserApi>
 */
final readonly class UserProcessor implements ProcessorInterface
{
    /**
     * @param ProcessorInterface<User, User|void> $processor
     */
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $processor,
        private UserPasswordHasherInterface $passwordHasher,
        private EntityManagerInterface $entityManager,
        private ObjectMapperInterface $objectMapper,
        private RunRepository $runRepository,
        private UserRepository $userRepository,
    ) {
    }

    /**
     * @param array<string, mixed> $uriVariables
     * @param array<string, mixed> $context
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): UserApi
    {
        // ObjectMapperInputProcessor has already mapped CreateUser/UpdateUser DTO → User entity.
        if (!$data instanceof User) {
            $entity = $this->objectMapper->map($data, User::class);
        } else {
            $entity = $data;
        }

        $isPatch = $operation instanceof Patch;

        // POST only: case-insensitive duplicate check (Symfony's UniqueEntity is case-sensitive).
        // On PATCH the entity already exists; the only risk is a rename collision, handled by the DB index + try/catch on flush.
        if (!$isPatch
            && null !== $this->userRepository->findOneByLowerName($entity->getFirstName(), $entity->getLastName())) {
            throw new UnprocessableEntityHttpException('Un coureur avec ce prénom et nom existe déjà.');
        }

        // Auto-add participations for all runs if none exist
        $userParticipations = $entity->getParticipations();
        if ($userParticipations->isEmpty()) {
            $this->addParticipation($entity);
        }

        // Hash password if provided
        if ($entity->getPlainPassword()) {
            $hashedPassword = $this->passwordHasher->hashPassword(
                $entity,
                $entity->getPlainPassword()
            );
            $entity->setPassword($hashedPassword);
            $entity->eraseCredentials();
        }

        try {
            $entity = $this->processor->process($entity, $operation, $uriVariables, $context);
        } catch (UniqueConstraintViolationException) {
            // The case-insensitive DB index on (LOWER(first_name), LOWER(last_name)) caught a duplicate
            // that the case-sensitive Symfony UniqueEntity validator missed (e.g. "Jean"/"JEAN").
            throw new UnprocessableEntityHttpException('Un coureur avec ce prénom et nom existe déjà.');
        }

        return $this->objectMapper->map($entity, UserApi::class);
    }

    private function addParticipation(User $user): void
    {
        $editionRuns = $this->runRepository->findCurrentEditionRuns();
        if ([] === $editionRuns) {
            return;
        }

        foreach ($editionRuns as $run) {
            $participation = new Participation();
            $participation->setUser($user);
            $participation->setRun($run);
            $this->entityManager->persist($participation);
        }
    }
}
