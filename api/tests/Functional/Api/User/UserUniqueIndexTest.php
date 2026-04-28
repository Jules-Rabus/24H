<?php

namespace App\Tests\Functional\Api\User;

use App\Entity\User;
use App\Tests\Functional\Api\AbstractTestCase;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;

final class UserUniqueIndexTest extends AbstractTestCase
{
    public function testDirectPersistOfDuplicateNameThrows(): void
    {
        /** @var EntityManagerInterface $em */
        $em = static::getContainer()->get(EntityManagerInterface::class);

        $u1 = new User();
        $u1->setFirstName('Pierre');
        $u1->setLastName('Martin');
        $u1->setSurname(null);
        $u1->setRoles(['ROLE_USER']);
        $em->persist($u1);
        $em->flush();

        $u2 = new User();
        $u2->setFirstName('PIERRE');
        $u2->setLastName('martin');
        $u2->setSurname(null);
        $u2->setRoles(['ROLE_USER']);
        $em->persist($u2);

        $this->expectException(UniqueConstraintViolationException::class);
        $em->flush();
    }
}
