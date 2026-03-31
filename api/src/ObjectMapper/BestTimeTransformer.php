<?php

namespace App\ObjectMapper;

use App\Entity\Participation;
use Symfony\Component\ObjectMapper\TransformCallableInterface;

/**
 * @implements TransformCallableInterface<object, object>
 */
final class BestTimeTransformer implements TransformCallableInterface
{
    public function __invoke(mixed $value, object $source, ?object $target): ?int
    {
        if (!\is_array($value) && !$value instanceof \Traversable) {
            return null;
        }

        $times = [];
        foreach ($value as $p) {
            if ($p instanceof Participation && null !== $p->getTotalTime()) {
                $times[] = $p->getTotalTime();
            }
        }

        return [] === $times ? null : min($times);
    }
}
