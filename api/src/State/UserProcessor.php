<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Participation;
use App\Entity\Run;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * @implements ProcessorInterface<User, User|void>
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
    ) {
    }

    /**
     * @param array<string, mixed> $uriVariables
     * @param array<string, mixed> $context
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): User
    {

        $userParticipations = $data->getParticipations();
        if($userParticipations->isEmpty()) {
           $this->addParticipation($data);
        }

        if (!$data->getPlainPassword()) {
            return $this->processor->process($data, $operation, $uriVariables, $context);
        }

        $hashedPassword = $this->passwordHasher->hashPassword(
            $data,
            $data->getPlainPassword()
        );
        $data->setPassword($hashedPassword);
        $data->eraseCredentials();

        return $this->processor->process($data, $operation, $uriVariables, $context);
    }

    private function addParticipation(User $user): void
    {
        $runRepository = $this->entityManager->getRepository(Run::class);
        $runs = $runRepository->findAll();
        foreach ($runs as $run) {
            $participation = new Participation();
            $participation->setUser($user);
            $participation->setRun($run);
            $this->entityManager->persist($participation);
        }
    }
}
