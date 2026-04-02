<?php

namespace App\ObjectMapper;

use App\Dto\Participation\ParticipationPublic;
use App\Entity\Participation;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\ObjectMapper\TransformCallableInterface;

/**
 * Transforms a Collection<Participation> into an array of ParticipationPublic DTOs.
 *
 * @implements TransformCallableInterface<object, object>
 */
final class ParticipationPublicCollectionTransformer implements TransformCallableInterface
{
    /**
     * @return list<ParticipationPublic>
     */
    public function __invoke(mixed $value, object $source, ?object $target): array
    {
        if (!$value instanceof Collection) {
            return [];
        }

        return $value->map(static function (Participation $p): ParticipationPublic {
            $dto = new ParticipationPublic();
            $dto->id = $p->getId();
            $dto->runId = $p->getRun()?->getId();
            $dto->runStartDate = $p->getRun()?->getStartDate();
            $dto->runEndDate = $p->getRun()?->getEndDate();
            $dto->runEdition = $p->getRun()?->getEdition();
            $dto->arrivalTime = $p->getArrivalTime();
            $dto->totalTime = $p->getTotalTime();
            $dto->status = $p->getStatus();

            return $dto;
        })->getValues();
    }
}
