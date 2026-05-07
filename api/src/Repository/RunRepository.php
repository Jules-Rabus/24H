<?php

namespace App\Repository;

use App\Entity\Run;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Run>
 */
class RunRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Run::class);
    }

    /**
     * Returns the "current" run by priority:
     *   1. a run currently in progress (startDate <= now <= endDate)
     *   2. otherwise the next upcoming run (closest startDate >= now)
     *   3. otherwise the most recent past run (largest startDate)
     *   4. null if no run exists
     */
    public function findCurrentRun(?\DateTimeInterface $now = null): ?Run
    {
        $now ??= new \DateTimeImmutable();

        $inProgress = $this->createQueryBuilder('r')
            ->andWhere('r.startDate <= :now')
            ->andWhere('r.endDate >= :now')
            ->setParameter('now', $now)
            ->orderBy('r.startDate', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
        if ($inProgress instanceof Run) {
            return $inProgress;
        }

        $upcoming = $this->createQueryBuilder('r')
            ->andWhere('r.startDate >= :now')
            ->setParameter('now', $now)
            ->orderBy('r.startDate', 'ASC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
        if ($upcoming instanceof Run) {
            return $upcoming;
        }

        $mostRecent = $this->createQueryBuilder('r')
            ->orderBy('r.startDate', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        return $mostRecent instanceof Run ? $mostRecent : null;
    }

    /**
     * Returns every run of the "current edition" (= the year of {@see findCurrentRun()}).
     *
     * The current edition is purely year-based, so all 24 runs of a given year are
     * returned together, regardless of whether each one is in progress, upcoming, or
     * already finished. Past editions are not included.
     *
     * @return list<Run>
     */
    public function findCurrentEditionRuns(?\DateTimeInterface $now = null): array
    {
        $pivot = $this->findCurrentRun($now);
        if (null === $pivot) {
            return [];
        }

        $edition = $pivot->getEdition() ?? (int) $pivot->getStartDate()->format('Y');

        // Filter on the year range so the query works for legacy rows where `edition` was never set.
        $start = new \DateTimeImmutable("$edition-01-01 00:00:00");
        $end = new \DateTimeImmutable(($edition + 1).'-01-01 00:00:00');

        $runs = $this->createQueryBuilder('r')
            ->andWhere('r.startDate >= :start')
            ->andWhere('r.startDate < :end')
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->orderBy('r.startDate', 'ASC')
            ->getQuery()
            ->getResult();

        return is_array($runs) ? array_values($runs) : [];
    }
}
