<?php

namespace App\Tests\Functional\Api\EventListener;

use App\Doctrine\Filter\ParticipationEditionFilter;
use App\Tests\Functional\Api\AbstractTestCase;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Covers ResetParticipationEditionFilterListener — verifies that the Doctrine
 * ParticipationEditionFilter is disabled at the start of every request so a
 * previous edition-filtered request doesn't leak into the next one.
 */
final class ResetParticipationEditionFilterListenerTest extends AbstractTestCase
{
    public function testFilterIsDisabledBetweenRequests(): void
    {
        // This test verifies the filter state is clean before/after requests.
        // The full cross-request isolation is covered in UserPublicTest::testEditionFilterDoesNotLeakIntoSubsequentRequests.

        $em = static::getContainer()->get(EntityManagerInterface::class);

        // Before any request: filter should be disabled by default
        $filters = $em->getFilters();
        $this->assertFalse(
            $filters->isEnabled(ParticipationEditionFilter::FILTER_NAME),
            'Filter must be disabled before any request'
        );

        // Make an edition-filtered request
        static::createClient()->request('GET', '/users/public?edition=2026', [
            'headers' => ['Accept' => 'application/json'],
        ]);
        $this->assertResponseIsSuccessful();

        // After the request, the ResetParticipationEditionFilterListener
        // onFinishRequest must have disabled the filter again.
        // We re-fetch the filters after the request.
        $em2 = static::getContainer()->get(EntityManagerInterface::class);
        $this->assertFalse(
            $em2->getFilters()->isEnabled(ParticipationEditionFilter::FILTER_NAME),
            'Filter must be disabled after request by ResetParticipationEditionFilterListener'
        );
    }

    public function testFilterIsDisabledAfterNonFilteredRequest(): void
    {
        // A regular non-edition-filtered request must NOT activate the filter
        $em = static::getContainer()->get(EntityManagerInterface::class);

        static::createClient()->request('GET', '/runs/public', [
            'headers' => ['Accept' => 'application/json'],
        ]);
        $this->assertResponseIsSuccessful();

        // After the request completes, the filter must be disabled
        $filters = $em->getFilters();
        $this->assertFalse(
            $filters->isEnabled(ParticipationEditionFilter::FILTER_NAME),
            'Filter must be disabled after a non-edition request'
        );
    }
}
