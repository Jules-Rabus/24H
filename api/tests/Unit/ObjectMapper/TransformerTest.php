<?php

namespace App\Tests\Unit\ObjectMapper;

use App\Entity\Participation;
use App\Entity\Run;
use App\ObjectMapper\AverageTimeTransformer;
use App\ObjectMapper\BestTimeTransformer;
use App\ObjectMapper\ParticipationCollectionTransformer;
use App\ObjectMapper\ParticipationPublicCollectionTransformer;
use App\ObjectMapper\TotalTimeTransformer;
use Doctrine\Common\Collections\ArrayCollection;
use PHPUnit\Framework\TestCase;

/**
 * Unit tests for ObjectMapper transformers that don't require the full Symfony
 * kernel (no storage, no entity manager).
 */
class TransformerTest extends TestCase
{
    private function makeFinishedParticipation(Run $run, int $offsetSeconds): Participation
    {
        $p = new Participation();
        $p->setRun($run);
        $arrival = \DateTimeImmutable::createFromMutable(
            \DateTime::createFromInterface($run->getStartDate())
        )->modify("+{$offsetSeconds} seconds");
        $p->setArrivalTime($arrival);

        return $p;
    }

    private function makeInProgressParticipation(Run $run): Participation
    {
        $p = new Participation();
        $p->setRun($run);
        $p->setArrivalTime(null);

        return $p;
    }

    private function makeRun(): Run
    {
        $run = new Run();
        $run->setStartDate(new \DateTimeImmutable('+1 day'));
        $run->setEndDate(new \DateTimeImmutable('+2 days'));

        return $run;
    }

    // ───────────────── AverageTimeTransformer ─────────────────

    public function testAverageTimeNullWhenNoParticipations(): void
    {
        $t = new AverageTimeTransformer();
        $source = new \stdClass();
        $this->assertNull($t(new ArrayCollection(), $source, null));
    }

    public function testAverageTimeNullWhenNonIterable(): void
    {
        $t = new AverageTimeTransformer();
        $source = new \stdClass();
        $this->assertNull($t('not-iterable', $source, null));
    }

    public function testAverageTimeNullWhenAllInProgress(): void
    {
        $t = new AverageTimeTransformer();
        $run = $this->makeRun();
        $coll = new ArrayCollection([
            $this->makeInProgressParticipation($run),
        ]);
        $source = new \stdClass();
        $this->assertNull($t($coll, $source, null));
    }

    public function testAverageTimeCalculation(): void
    {
        $t = new AverageTimeTransformer();
        $run = $this->makeRun();
        $coll = new ArrayCollection([
            $this->makeFinishedParticipation($run, 1000),
            $this->makeFinishedParticipation($run, 2000),
            $this->makeInProgressParticipation($run), // excluded
        ]);
        $source = new \stdClass();
        // Average of 1000+2000 = 1500
        $this->assertSame(1500, $t($coll, $source, null));
    }

    public function testAverageTimeWithArray(): void
    {
        $t = new AverageTimeTransformer();
        $run = $this->makeRun();
        $arr = [
            $this->makeFinishedParticipation($run, 1000),
            $this->makeFinishedParticipation($run, 3000),
        ];
        $source = new \stdClass();
        $this->assertSame(2000, $t($arr, $source, null));
    }

    // ───────────────── BestTimeTransformer ─────────────────

    public function testBestTimeNullWhenNonIterable(): void
    {
        $t = new BestTimeTransformer();
        $source = new \stdClass();
        $this->assertNull($t('not-iterable', $source, null));
    }

    public function testBestTimeNullWhenAllInProgress(): void
    {
        $t = new BestTimeTransformer();
        $run = $this->makeRun();
        $coll = new ArrayCollection([
            $this->makeInProgressParticipation($run),
        ]);
        $source = new \stdClass();
        $this->assertNull($t($coll, $source, null));
    }

    public function testBestTimeReturnsMinimum(): void
    {
        $t = new BestTimeTransformer();
        $run = $this->makeRun();
        $coll = new ArrayCollection([
            $this->makeFinishedParticipation($run, 3000),
            $this->makeFinishedParticipation($run, 1500),
            $this->makeFinishedParticipation($run, 4000),
        ]);
        $source = new \stdClass();
        $this->assertSame(1500, $t($coll, $source, null));
    }

    // ───────────────── TotalTimeTransformer ─────────────────

    public function testTotalTimeNullWhenNonIterable(): void
    {
        $t = new TotalTimeTransformer();
        $source = new \stdClass();
        $this->assertNull($t('not-iterable', $source, null));
    }

    public function testTotalTimeNullWhenAllInProgress(): void
    {
        $t = new TotalTimeTransformer();
        $run = $this->makeRun();
        $coll = new ArrayCollection([
            $this->makeInProgressParticipation($run),
        ]);
        $source = new \stdClass();
        $this->assertNull($t($coll, $source, null));
    }

    public function testTotalTimeIsSumOfFinished(): void
    {
        $t = new TotalTimeTransformer();
        $run = $this->makeRun();
        $coll = new ArrayCollection([
            $this->makeFinishedParticipation($run, 1000),
            $this->makeFinishedParticipation($run, 2500),
            $this->makeInProgressParticipation($run),
        ]);
        $source = new \stdClass();
        $this->assertSame(3500, $t($coll, $source, null));
    }

    // ───────────────── ParticipationCollectionTransformer ─────────────────

    public function testParticipationCollectionTransformerNonCollection(): void
    {
        $t = new ParticipationCollectionTransformer();
        $source = new \stdClass();
        $this->assertSame([], $t('not-a-collection', $source, null));
    }

    public function testParticipationCollectionTransformerReturnsIds(): void
    {
        $t = new ParticipationCollectionTransformer();
        $run = $this->makeRun();
        $p1 = $this->makeFinishedParticipation($run, 1000);
        $p2 = $this->makeInProgressParticipation($run);

        // IDs are null since entities are not persisted, but the transformer
        // should still return the id array (even if null values).
        $coll = new ArrayCollection([$p1, $p2]);
        $source = new \stdClass();
        $result = $t($coll, $source, null);
        $this->assertIsArray($result);
        $this->assertCount(2, $result);
    }

    // ───────────────── ParticipationPublicCollectionTransformer ─────────────────

    public function testParticipationPublicCollectionTransformerNonCollection(): void
    {
        $t = new ParticipationPublicCollectionTransformer();
        $source = new \stdClass();
        $this->assertSame([], $t('not-a-collection', $source, null));
    }

    /**
     * Set the ID on an unpersisted entity using reflection (the transformer
     * requires a non-null int but entities only get IDs after a DB flush).
     */
    private function setParticipationId(Participation $p, int $id): void
    {
        $ref = new \ReflectionProperty(Participation::class, 'id');
        $ref->setAccessible(true);
        $ref->setValue($p, $id);
    }

    public function testParticipationPublicCollectionTransformerReturnsPublicDtos(): void
    {
        $t = new ParticipationPublicCollectionTransformer();
        $run = $this->makeRun();
        $p = $this->makeFinishedParticipation($run, 3600);
        $this->setParticipationId($p, 1);

        $coll = new ArrayCollection([$p]);
        $source = new \stdClass();
        $result = $t($coll, $source, null);

        $this->assertCount(1, $result);
        $this->assertSame('FINISHED', $result[0]->status);
        $this->assertSame(3600, $result[0]->totalTime);
    }

    public function testParticipationPublicCollectionTransformerInProgress(): void
    {
        $t = new ParticipationPublicCollectionTransformer();
        $run = $this->makeRun();
        $p = $this->makeInProgressParticipation($run);
        $this->setParticipationId($p, 2);

        $coll = new ArrayCollection([$p]);
        $source = new \stdClass();
        $result = $t($coll, $source, null);

        $this->assertCount(1, $result);
        $this->assertSame('IN_PROGRESS', $result[0]->status);
        $this->assertNull($result[0]->totalTime);
    }
}
