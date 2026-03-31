<?php

namespace App\ObjectMapper;

use App\ApiResource\Participation\ParticipationApi;
use App\ApiResource\Run\RunApi;
use App\ApiResource\User\UserApi;
use App\Dto\Participation\ParticipationRef;
use App\Dto\Run\RunRef;
use App\Dto\User\UserRef;
use App\Entity\Participation;
use App\Entity\Run;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\ObjectMapper\ObjectMapperInterface;
use Symfony\Component\ObjectMapper\TransformCallableInterface;

/**
 * @implements TransformCallableInterface<object, object>
 */
final readonly class RelationTransformer implements TransformCallableInterface
{
    public function __construct(
        private ObjectMapperInterface $objectMapper,
        private EntityManagerInterface $entityManager,
    ) {
    }

    public function __invoke(mixed $value, object $source, ?object $target): mixed
    {
        if (null === $value) {
            return null;
        }

        // Output mapping: Entity -> DTO (Ref)
        if ($value instanceof Run) {
            return $this->objectMapper->map($value, RunRef::class);
        }
        if ($value instanceof User) {
            return $this->objectMapper->map($value, UserRef::class);
        }
        if ($value instanceof Participation) {
            return $this->objectMapper->map($value, ParticipationRef::class);
        }

        // Input mapping: DTO (Api Resource) -> Entity
        if ($value instanceof RunApi || $value instanceof RunRef) {
            if (isset($value->id) && $value->id) {
                return $this->entityManager->find(Run::class, $value->id);
            }

            return $this->objectMapper->map($value, Run::class);
        }
        if ($value instanceof UserApi || $value instanceof UserRef) {
            if (isset($value->id) && $value->id) {
                return $this->entityManager->find(User::class, $value->id);
            }

            return $this->objectMapper->map($value, User::class);
        }
        if ($value instanceof ParticipationApi || $value instanceof ParticipationRef) {
            if (isset($value->id) && $value->id) {
                return $this->entityManager->find(Participation::class, $value->id);
            }

            return $this->objectMapper->map($value, Participation::class);
        }

        return $value;
    }
}
