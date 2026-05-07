<?php

namespace App\Doctrine\Filter;

use App\Entity\Participation;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\Query\Filter\SQLFilter;

/**
 * Restricts every query touching Participation (root, joins, lazy collection
 * loads) to a single edition. Activated on demand by EditionParameterProvider
 * for the public users endpoints, so the embedded `participations` array of a
 * user only contains the requested edition's data.
 */
final class ParticipationEditionFilter extends SQLFilter
{
    public const string FILTER_NAME = 'participation_edition';
    public const string PARAMETER = 'edition';

    public function addFilterConstraint(ClassMetadata $targetEntity, string $targetTableAlias): string
    {
        if (Participation::class !== $targetEntity->getName()) {
            return '';
        }

        // Subquery rather than JOIN so we stay alias-safe inside SQLFilter.
        // Doctrine's underscore_number_aware strategy maps Run::class to table `run` (id, edition).
        return sprintf(
            '%s.run_id IN (SELECT r.id FROM run r WHERE r.edition = %s)',
            $targetTableAlias,
            $this->getParameter(self::PARAMETER),
        );
    }
}
