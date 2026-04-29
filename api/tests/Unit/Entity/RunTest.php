<?php

namespace Unit\Entity;

use App\Entity\Run;
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

    public function testSyncEditionFromStartDate(): void
    {
        $run = new Run();
        $run->setStartDate(new \DateTimeImmutable('2026-06-15'));
        $run->syncEditionFromStartDate();
        $this->assertSame(2026, $run->getEdition());
    }

    public function testSyncEditionUpdatesOnStartDateChange(): void
    {
        $run = new Run();
        $run->setStartDate(new \DateTimeImmutable('2025-03-01'));
        $run->syncEditionFromStartDate();
        $this->assertSame(2025, $run->getEdition());

        $run->setStartDate(new \DateTimeImmutable('2027-09-10'));
        $run->syncEditionFromStartDate();
        $this->assertSame(2027, $run->getEdition());
    }
}
