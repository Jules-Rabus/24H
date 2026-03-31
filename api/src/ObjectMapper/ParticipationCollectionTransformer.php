<?php

namespace App\ObjectMapper;

use App\Entity\Participation;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\ObjectMapper\TransformCallableInterface;

/**
 * @implements TransformCallableInterface<object, object>
 */
final class ParticipationCollectionTransformer implements TransformCallableInterface
{
    /**
     * @return list<int|null>
     */
    public function __invoke(mixed $value, object $source, ?object $target): array
    {
        if (!$value instanceof Collection) {
            return [];
        }

        return $value->map(static fn (Participation $p) => $p->getId())->getValues();
    }
}
