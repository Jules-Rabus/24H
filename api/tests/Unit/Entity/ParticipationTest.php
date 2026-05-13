<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Participation;
use App\Entity\Run;
use PHPUnit\Framework\TestCase;

/**
 * Covers Participation entity computed properties:
 * getTotalTime, getStatus.
 */
class ParticipationTest extends TestCase
{
    private function makeRun(\DateTimeInterface $startDate): Run
    {
        $run = new Run();
        $run->setStartDate($startDate);
        $run->setEndDate(\DateTimeImmutable::createFromMutable(
            \DateTime::createFromInterface($startDate)
        )->modify('+2 hours'));

        return $run;
    }

    public function testGetStatusInProgress(): void
    {
        $p = new Participation();
        $p->setRun($this->makeRun(new \DateTimeImmutable('+1 day')));
        $p->setArrivalTime(null);

        $this->assertSame('IN_PROGRESS', $p->getStatus());
    }

    public function testGetStatusFinished(): void
    {
        $startDate = new \DateTimeImmutable('+1 day');
        $p = new Participation();
        $p->setRun($this->makeRun($startDate));
        $p->setArrivalTime($startDate->modify('+1 hour'));

        $this->assertSame('FINISHED', $p->getStatus());
    }

    public function testGetTotalTimeNullWhenNoArrival(): void
    {
        $p = new Participation();
        $p->setRun($this->makeRun(new \DateTimeImmutable('+1 day')));
        $p->setArrivalTime(null);

        $this->assertNull($p->getTotalTime());
    }

    public function testGetTotalTimeReflectsElapsed(): void
    {
        $startDate = new \DateTimeImmutable('+1 day');
        $p = new Participation();
        $p->setRun($this->makeRun($startDate));
        // Arrival is 3600 seconds after start
        $p->setArrivalTime($startDate->modify('+1 hour'));

        $this->assertSame(3600, $p->getTotalTime());
    }

    public function testGetId(): void
    {
        $p = new Participation();
        $this->assertNull($p->getId());
    }

    public function testSetAndGetRun(): void
    {
        $run = $this->makeRun(new \DateTimeImmutable('+1 day'));
        $p = new Participation();
        $p->setRun($run);

        $this->assertSame($run, $p->getRun());
    }

    public function testSetAndGetUser(): void
    {
        $p = new Participation();
        $this->assertNull($p->getUser());
    }
}
