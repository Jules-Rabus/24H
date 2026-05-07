<?php

namespace App\EventListener;

use App\Doctrine\Filter\ParticipationEditionFilter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpKernel\Event\FinishRequestEvent;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Keeps {@see ParticipationEditionFilter} off by default.
 *
 * The filter is activated on demand by EditionParameterProvider when an
 * `?edition=` query parameter reaches a User endpoint, but the EntityManager
 * survives across requests in long-running runtimes (FrankenPHP worker mode).
 * Without this reset, a previous request's filter state leaks into unrelated
 * subsequent requests, producing empty result sets in places that never asked
 * for filtering.
 */
final readonly class ResetParticipationEditionFilterListener
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
    }

    #[AsEventListener(event: KernelEvents::REQUEST, priority: 256)]
    public function onRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }
        $this->disableFilter();
    }

    #[AsEventListener(event: KernelEvents::FINISH_REQUEST)]
    public function onFinishRequest(FinishRequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }
        $this->disableFilter();
    }

    private function disableFilter(): void
    {
        $filters = $this->entityManager->getFilters();
        if ($filters->isEnabled(ParticipationEditionFilter::FILTER_NAME)) {
            $filters->disable(ParticipationEditionFilter::FILTER_NAME);
        }
    }
}
