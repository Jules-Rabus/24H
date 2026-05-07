<?php

namespace App\Tests\Functional\Api\Run;

use App\Factory\RunFactory;
use App\Repository\RunRepository;
use App\Tests\Functional\Api\AbstractTestCase;

final class RunRepositoryTest extends AbstractTestCase
{
    private function repo(): RunRepository
    {
        return static::getContainer()->get(RunRepository::class);
    }

    public function testReturnsRunInProgressFirst(): void
    {
        RunFactory::createOne([
            'startDate' => new \DateTime('+1 day'),
            'endDate' => new \DateTime('+2 days'),
        ]);
        $current = RunFactory::createOne([
            'startDate' => new \DateTime('-1 hour'),
            'endDate' => new \DateTime('+1 hour'),
        ]);

        $this->assertSame($current->getId(), $this->repo()->findCurrentRun()?->getId());
    }

    public function testReturnsClosestUpcomingRunWhenNoneInProgress(): void
    {
        $soon = RunFactory::createOne([
            'startDate' => new \DateTime('+1 day'),
            'endDate' => new \DateTime('+2 days'),
        ]);
        RunFactory::createOne([
            'startDate' => new \DateTime('+10 days'),
            'endDate' => new \DateTime('+11 days'),
        ]);

        $this->assertSame($soon->getId(), $this->repo()->findCurrentRun()?->getId());
    }

    public function testReturnsMostRecentPastRunWhenAllPast(): void
    {
        RunFactory::createOne([
            'startDate' => new \DateTime('-10 days'),
            'endDate' => new \DateTime('-9 days'),
        ]);
        $recent = RunFactory::createOne([
            'startDate' => new \DateTime('-3 days'),
            'endDate' => new \DateTime('-2 days'),
        ]);

        $this->assertSame($recent->getId(), $this->repo()->findCurrentRun()?->getId());
    }

    public function testReturnsNullWhenNoRun(): void
    {
        $this->assertNull($this->repo()->findCurrentRun());
    }

    public function testFindCurrentEditionRunsReturnsAllRunsOfPivotYearOnly(): void
    {
        $currentYear = (int) date('Y');

        // Past edition
        RunFactory::createOne([
            'startDate' => new \DateTime(($currentYear - 1).'-06-13 10:00:00'),
            'endDate' => new \DateTime(($currentYear - 1).'-06-13 12:00:00'),
        ]);
        // Current-edition runs (same year)
        $a = RunFactory::createOne([
            'startDate' => new \DateTime('-1 hour'),
            'endDate' => new \DateTime('+1 hour'),
        ]);
        $b = RunFactory::createOne([
            'startDate' => new \DateTime("$currentYear-12-31 10:00:00"),
            'endDate' => new \DateTime("$currentYear-12-31 12:00:00"),
        ]);

        $runs = $this->repo()->findCurrentEditionRuns();
        $ids = array_map(static fn ($r) => $r->getId(), $runs);

        $this->assertContains($a->getId(), $ids);
        $this->assertContains($b->getId(), $ids);
        $this->assertCount(2, $ids);
    }

    public function testFindCurrentEditionRunsReturnsEmptyWhenNoRun(): void
    {
        $this->assertSame([], $this->repo()->findCurrentEditionRuns());
    }
}
