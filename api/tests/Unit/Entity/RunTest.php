<?php

namespace Unit\Entity;

use App\Entity\Run;
use Doctrine\Common\Collections\ArrayCollection;
use PHPUnit\Framework\TestCase;

class RunTest extends TestCase
{
    public function testGetId()
    {
        $reservation = new Run();
        $this->assertNull($reservation->getId());
    }

    public function testGetStartDate()
    {
        $reservation = new Run();
        $reservation->setStartDate(new \DateTimeImmutable('2021-01-01'));
        $this->assertEquals(new \DateTimeImmutable('2021-01-01'), $reservation->getStartDate());
    }

    public function testGetEndDate()
    {
        $reservation = new Run();
        $reservation->setEndDate(new \DateTimeImmutable('2021-01-01'));
        $this->assertEquals(new \DateTimeImmutable('2021-01-01'), $reservation->getEndDate());
    }
}
