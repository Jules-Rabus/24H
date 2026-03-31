<?php

namespace App\State\User;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Dto\User\UserMe;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\ObjectMapper\ObjectMapperInterface;

/**
 * @implements ProviderInterface<UserMe>
 */
final readonly class CurrentUserProvider implements ProviderInterface
{
    public function __construct(
        private Security $security,
        private ObjectMapperInterface $objectMapper,
    ) {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): UserMe
    {
        /** @var User $user */
        $user = $this->security->getUser();

        return $this->objectMapper->map($user, UserMe::class);
    }
}
