<?php

namespace App\Tests\Unit\Doctrine;

use App\Doctrine\Filter\ParticipationEditionFilter;
use PHPUnit\Framework\TestCase;

/**
 * Light unit tests for ParticipationEditionFilter constants.
 * The actual filtering behavior is covered by the functional tests in
 * UserPublicTest and ParticipationPublicGetTest.
 */
class ParticipationEditionFilterTest extends TestCase
{
    public function testFilterNameConstant(): void
    {
        $this->assertSame('participation_edition', ParticipationEditionFilter::FILTER_NAME);
    }

    public function testParameterConstant(): void
    {
        $this->assertSame('edition', ParticipationEditionFilter::PARAMETER);
    }
}
