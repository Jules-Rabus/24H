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
}
