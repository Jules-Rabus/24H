<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\User\UserApi;
use App\Dto\User\CreateUser;
use App\Dto\User\UpdateUser;
use App\Entity\Participation;
use App\Entity\User;
use App\Repository\RunRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
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
    ) {
    }

    /**
     * @param array<string, mixed> $uriVariables
     * @param array<string, mixed> $context
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): UserApi
    {
        // For PATCH, we get the existing entity from context
        if ($data instanceof UpdateUser) {
            $entity = $context['previous_data'] ?? null;
            if (!$entity instanceof User) {
                throw new \LogicException('Expected previous_data to be a User entity.');
            }
            // Apply only non-null fields from DTO to entity
            if (null !== $data->firstName) {
                $entity->setFirstName($data->firstName);
            }
            if (null !== $data->lastName) {
                $entity->setLastName($data->lastName);
            }
            if (null !== $data->surname) {
                $entity->setSurname($data->surname);
            }
            if (null !== $data->email) {
                $entity->setEmail($data->email);
            }
            if (null !== $data->organization) {
                $entity->setOrganization($data->organization);
            }
            if (null !== $data->roles) {
                $entity->setRoles($data->roles);
            }
            if (null !== $data->plainPassword) {
                $entity->setPlainPassword($data->plainPassword);
            }
        } else {
            // POST: ObjectMapperInputProcessor already mapped CreateUser DTO → Entity
            if (!$data instanceof User) {
                $entity = $this->objectMapper->map($data, User::class);
            } else {
                $entity = $data;
            }
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

        $entity = $this->processor->process($entity, $operation, $uriVariables, $context);

        return $this->objectMapper->map($entity, UserApi::class);
    }

    private function addParticipation(User $user): void
    {
        $run = $this->runRepository->findCurrentRun();
        if (null === $run) {
            return;
        }

        $participation = new Participation();
        $participation->setUser($user);
        $participation->setRun($run);
        $this->entityManager->persist($participation);
    }
}
