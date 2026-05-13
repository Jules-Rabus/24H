<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Participation;
use App\Entity\Run;
use PHPUnit\Framework\TestCase;

/**
 * Covers the computed property methods on Run that are not covered by existing tests:
 * getAverageTime, getFastestTime, getInProgressParticipantsCount,
 * getFinishedParticipantsCount, isFinished.
 */
class RunComputedPropertiesTest extends TestCase
{
    private function makeRun(\DateTimeInterface $start, \DateTimeInterface $end): Run
    {
        $run = new Run();
        $run->setStartDate($start);
        $run->setEndDate($end);

        return $run;
    }

    private function makeParticipation(Run $run, ?int $arrivalOffsetSeconds = null): Participation
    {
        $p = new Participation();
        $p->setRun($run);
        if (null !== $arrivalOffsetSeconds) {
            $arrival = \DateTimeImmutable::createFromMutable(
                \DateTime::createFromInterface($run->getStartDate())
            )->modify("+{$arrivalOffsetSeconds} seconds");
            $p->setArrivalTime($arrival);
        }

        return $p;
    }

    public function testGetParticipantsCountReflectsParticipations(): void
    {
        $run = $this->makeRun(new \DateTimeImmutable('+1 day'), new \DateTimeImmutable('+2 days'));

        $this->assertSame(0, $run->getParticipantsCount());
        $run->addParticipation($this->makeParticipation($run));
        $this->assertSame(1, $run->getParticipantsCount());
    }

    public function testGetInProgressParticipantsCount(): void
    {
        $run = $this->makeRun(new \DateTimeImmutable('+1 day'), new \DateTimeImmutable('+2 days'));

        $run->addParticipation($this->makeParticipation($run, null)); // IN_PROGRESS
        $run->addParticipation($this->makeParticipation($run, null)); // IN_PROGRESS
        $run->addParticipation($this->makeParticipation($run, 3600)); // FINISHED

        $this->assertSame(2, $run->getInProgressParticipantsCount());
    }

    public function testGetFinishedParticipantsCount(): void
    {
        $run = $this->makeRun(new \DateTimeImmutable('+1 day'), new \DateTimeImmutable('+2 days'));

        $run->addParticipation($this->makeParticipation($run, null)); // IN_PROGRESS
        $run->addParticipation($this->makeParticipation($run, 3600)); // FINISHED
        $run->addParticipation($this->makeParticipation($run, 7200)); // FINISHED

        $this->assertSame(2, $run->getFinishedParticipantsCount());
    }

    public function testGetAverageTimeNoFinished(): void
    {
        $run = $this->makeRun(new \DateTimeImmutable('+1 day'), new \DateTimeImmutable('+2 days'));

        $run->addParticipation($this->makeParticipation($run, null)); // IN_PROGRESS

        $this->assertNull($run->getAverageTime());
    }

    public function testGetAverageTimeWithFinished(): void
    {
        $run = $this->makeRun(new \DateTimeImmutable('+1 day'), new \DateTimeImmutable('+2 days'));

        $run->addParticipation($this->makeParticipation($run, 1000)); // 1000s
        $run->addParticipation($this->makeParticipation($run, 2000)); // 2000s

        // Average = (1000+2000)/2 = 1500
        $this->assertSame(1500, $run->getAverageTime());
    }

    public function testGetAverageTimeRounded(): void
    {
        $run = $this->makeRun(new \DateTimeImmutable('+1 day'), new \DateTimeImmutable('+2 days'));

        $run->addParticipation($this->makeParticipation($run, 1000));
        $run->addParticipation($this->makeParticipation($run, 2001));

        // Average = (1000+2001)/2 = 1500.5, rounded to 1501
        $this->assertSame(1501, $run->getAverageTime());
    }

    public function testGetFastestTimeNoFinished(): void
    {
        $run = $this->makeRun(new \DateTimeImmutable('+1 day'), new \DateTimeImmutable('+2 days'));

        $run->addParticipation($this->makeParticipation($run, null)); // IN_PROGRESS

        $this->assertNull($run->getFastestTime());
    }

    public function testGetFastestTimeWithFinished(): void
    {
        $run = $this->makeRun(new \DateTimeImmutable('+1 day'), new \DateTimeImmutable('+2 days'));

        $run->addParticipation($this->makeParticipation($run, 3000));
        $run->addParticipation($this->makeParticipation($run, 1500));
        $run->addParticipation($this->makeParticipation($run, 4000));

        $this->assertSame(1500, $run->getFastestTime());
    }

    public function testIsFinishedReturnsTrueForPastRun(): void
    {
        $run = $this->makeRun(new \DateTimeImmutable('-2 hours'), new \DateTimeImmutable('-1 hour'));

        $this->assertTrue($run->isFinished());
    }

    public function testIsFinishedReturnsFalseForFutureRun(): void
    {
        $run = $this->makeRun(new \DateTimeImmutable('+1 hour'), new \DateTimeImmutable('+2 hours'));

        $this->assertFalse($run->isFinished());
    }

    public function testAddAndRemoveParticipation(): void
    {
        $run = $this->makeRun(new \DateTimeImmutable('+1 day'), new \DateTimeImmutable('+2 days'));
        $p = $this->makeParticipation($run, null);

        $run->addParticipation($p);
        $this->assertSame(1, $run->getParticipantsCount());

        // Adding the same participation again should not duplicate
        $run->addParticipation($p);
        $this->assertSame(1, $run->getParticipantsCount());

        $run->removeParticipation($p);
        $this->assertSame(0, $run->getParticipantsCount());
    }
}
