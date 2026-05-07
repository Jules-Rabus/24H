<?php

namespace App\State\User;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Parameter;
use ApiPlatform\State\ParameterNotFound;
use ApiPlatform\State\ParameterProviderInterface;
use App\Doctrine\Filter\ParticipationEditionFilter;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Activates {@see ParticipationEditionFilter} for the current request when the
 * `edition` query parameter is provided. With the filter on, every Doctrine
 * query touching Participation (including the lazy load of `User::participations`)
 * is restricted to that edition — so the public users endpoints expose only
 * the requested edition's data.
 */
final readonly class EditionParameterProvider implements ParameterProviderInterface
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
    }

    public function provide(Parameter $parameter, array $parameters = [], array $context = []): ?Operation
    {
        $value = $parameter->getValue();
        if ($value instanceof ParameterNotFound) {
            return null;
        }
        if (!is_numeric($value)) {
            return null;
        }

        $filters = $this->entityManager->getFilters();
        /** @var ParticipationEditionFilter $filter */
        $filter = $filters->isEnabled(ParticipationEditionFilter::FILTER_NAME)
            ? $filters->getFilter(ParticipationEditionFilter::FILTER_NAME)
            : $filters->enable(ParticipationEditionFilter::FILTER_NAME);
        $filter->setParameter(ParticipationEditionFilter::PARAMETER, (int) $value, 'integer');

        return null;
    }
}
