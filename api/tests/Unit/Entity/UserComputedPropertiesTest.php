<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Participation;
use App\Entity\Run;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

/**
 * Covers User entity computed properties:
 * getFinishedParticipations, getFinishedParticipationsCount, getEditions,
 * addParticipation, removeParticipation.
 */
class UserComputedPropertiesTest extends TestCase
{
    private function makeRun(int $editionYear, int $offsetHours = 24): Run
    {
        $start = new \DateTimeImmutable("{$editionYear}-06-13 10:00:00");
        $run = new Run();
        $run->setStartDate($start);
        $run->setEndDate($start->modify("+{$offsetHours} hours"));
        $run->syncEditionFromStartDate();

        return $run;
    }

    private function makeParticipation(User $user, Run $run, ?string $arrivalModifier = null): Participation
    {
        $p = new Participation();
        $p->setUser($user);
        $p->setRun($run);
        if (null !== $arrivalModifier) {
            $p->setArrivalTime($run->getStartDate()->modify($arrivalModifier));
        }
        $user->addParticipation($p);

        return $p;
    }

    public function testGetFinishedParticipationsEmpty(): void
    {
        $user = new User();
        $this->assertSame([], $user->getFinishedParticipations());
    }

    public function testGetFinishedParticipationsFiltersCorrectly(): void
    {
        $user = new User();
        $run = $this->makeRun(2026);

        $inProgress = $this->makeParticipation($user, $run, null);
        $finished = $this->makeParticipation($user, $run, '+1 hour');

        $finished2 = $this->makeParticipation($user, $run, '+2 hours');

        $result = $user->getFinishedParticipations();
        $this->assertCount(2, $result);
        $this->assertContains($finished, $result);
        $this->assertContains($finished2, $result);
        $this->assertNotContains($inProgress, $result);
    }

    public function testGetFinishedParticipationsCountIsCorrect(): void
    {
        $user = new User();
        $run = $this->makeRun(2026);

        $this->makeParticipation($user, $run, '+1 hour'); // FINISHED
        $this->makeParticipation($user, $run, null);        // IN_PROGRESS

        $this->assertSame(1, $user->getFinishedParticipationsCount());
    }

    public function testGetEditionsReturnsDistinctYears(): void
    {
        $user = new User();
        $run2025 = $this->makeRun(2025);
        $run2026 = $this->makeRun(2026);

        $this->makeParticipation($user, $run2025);
        $this->makeParticipation($user, $run2026);

        $editions = $user->getEditions();
        $this->assertContains(2025, $editions);
        $this->assertContains(2026, $editions);
        $this->assertCount(2, $editions);
    }

    public function testGetEditionsSortedDescending(): void
    {
        $user = new User();
        $run2024 = $this->makeRun(2024);
        $run2026 = $this->makeRun(2026);
        $run2025 = $this->makeRun(2025);

        $this->makeParticipation($user, $run2024);
        $this->makeParticipation($user, $run2026);
        $this->makeParticipation($user, $run2025);

        $editions = $user->getEditions();
        // krsort → descending
        $this->assertSame([2026, 2025, 2024], $editions);
    }

    public function testGetEditionsEmptyWhenNoParticipations(): void
    {
        $user = new User();
        $this->assertSame([], $user->getEditions());
    }

    public function testAddParticipationDoesNotDuplicate(): void
    {
        $user = new User();
        $run = $this->makeRun(2026);
        $p = new Participation();
        $p->setRun($run);

        $user->addParticipation($p);
        $user->addParticipation($p); // duplicate

        $this->assertCount(1, $user->getParticipations());
    }

    public function testRemoveParticipation(): void
    {
        $user = new User();
        $run = $this->makeRun(2026);
        $p = $this->makeParticipation($user, $run, null);

        $this->assertCount(1, $user->getParticipations());
        $user->removeParticipation($p);
        $this->assertCount(0, $user->getParticipations());
    }

    public function testOrganizationGetterSetter(): void
    {
        $user = new User();
        $this->assertNull($user->getOrganization());
        $user->setOrganization('ACME');
        $this->assertSame('ACME', $user->getOrganization());
    }

    public function testSurnameGetterSetter(): void
    {
        $user = new User();
        $user->setSurname('Speedy');
        $this->assertSame('Speedy', $user->getSurname());
    }

    public function testFirstLastNameSetterGetter(): void
    {
        $user = new User();
        $user->setFirstName('Jean');
        $user->setLastName('Dupont');
        $this->assertSame('Jean', $user->getFirstName());
        $this->assertSame('Dupont', $user->getLastName());
    }

    public function testSetRoles(): void
    {
        $user = new User();
        $user->setRoles(['ROLE_ADMIN']);
        $roles = $user->getRoles();
        $this->assertContains('ROLE_ADMIN', $roles);
        $this->assertContains('ROLE_USER', $roles); // always added
    }

    public function testPlainPassword(): void
    {
        $user = new User();
        $user->setPlainPassword('mysecret');
        $this->assertSame('mysecret', $user->getPlainPassword());
    }

    public function testEraseCredentials(): void
    {
        $user = new User();
        $user->setPlainPassword('mysecret');
        $user->eraseCredentials(); // should not throw
        // eraseCredentials() currently does nothing (commented out), but it must be callable
        $this->assertSame('mysecret', $user->getPlainPassword());
    }
}
