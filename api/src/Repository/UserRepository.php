<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;

/**
 * @extends ServiceEntityRepository<User>
 */
class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    public function findOneByLowerName(string $firstName, string $lastName): ?User
    {
        $result = $this->createQueryBuilder('u')
            ->andWhere('LOWER(u.firstName) = :fn')
            ->andWhere('LOWER(u.lastName) = :ln')
            ->setParameter('fn', mb_strtolower(trim($firstName)))
            ->setParameter('ln', mb_strtolower(trim($lastName)))
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        return $result instanceof User ? $result : null;
    }

    /**
     * Used to upgrade (rehash) the user's password automatically over time.
     */
    public function upgradePassword(PasswordAuthenticatedUserInterface $user, string $newHashedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', $user::class));
        }

        $user->setPassword($newHashedPassword);
        $this->getEntityManager()->persist($user);
        $this->getEntityManager()->flush();
    }
}
