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
}
