<?php

namespace App\ObjectMapper;

use Symfony\Component\ObjectMapper\ObjectMapperInterface;
use Symfony\Component\ObjectMapper\TransformCallableInterface;

final readonly class RelationToDtoTransformer implements TransformCallableInterface
{
    public function __construct(
        private ObjectMapperInterface $objectMapper
    ) {
    }

    public function __invoke(mixed $value, object $source, ?object $target): mixed
    {
        if (null === $value) {
            return null;
        }

        // Si la valeur est déjà un objet du bon type (cas peu probable ici)
        if (!\is_object($value)) {
            return $value;
        }

        // On détermine la classe de destination en fonction de la propriété cible si possible
        // Mais ici on va être plus simple : on laisse le mapper décider via le type hint de la propriété cible
        // En fait, __invoke ne reçoit pas le type attendu.
        
        // On va tricher un peu en vérifiant le type de l'objet source
        // Mais le plus simple est de laisser le mapper faire le boulot récursivement 
        // si on lui demande explicitement de mapper vers une classe spécifique.
        
        return $value;
    }
}
