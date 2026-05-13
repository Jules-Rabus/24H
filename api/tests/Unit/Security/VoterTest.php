<?php

namespace App\Tests\Unit\Security;

use App\ApiResource\Participation\ParticipationApi;
use App\ApiResource\User\UserApi;
use App\Dto\User\UserRef;
use App\Entity\User;
use App\Security\Voter\ParticipationVoter;
use App\Security\Voter\UserVoter;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;

/**
 * Unit tests for ParticipationVoter and UserVoter.
 */
class VoterTest extends TestCase
{
    // ───────────────── ParticipationVoter ─────────────────

    public function testParticipationVoterSupportsTrueForViewAttribute(): void
    {
        $voter = new ParticipationVoter();
        $subject = new ParticipationApi();

        // Call supports via reflection since it's protected
        $ref = new \ReflectionMethod(ParticipationVoter::class, 'supports');
        $ref->setAccessible(true);

        $this->assertTrue($ref->invoke($voter, 'PARTICIPATION_VIEW', $subject));
    }

    public function testParticipationVoterDoesNotSupportWrongAttribute(): void
    {
        $voter = new ParticipationVoter();
        $subject = new ParticipationApi();

        $ref = new \ReflectionMethod(ParticipationVoter::class, 'supports');
        $ref->setAccessible(true);

        $this->assertFalse($ref->invoke($voter, 'WRONG_ATTRIBUTE', $subject));
    }

    public function testParticipationVoterDoesNotSupportWrongSubject(): void
    {
        $voter = new ParticipationVoter();

        $ref = new \ReflectionMethod(ParticipationVoter::class, 'supports');
        $ref->setAccessible(true);

        $this->assertFalse($ref->invoke($voter, 'PARTICIPATION_VIEW', new \stdClass()));
    }

    public function testParticipationVoterGrantsAccessForOwner(): void
    {
        $voter = new ParticipationVoter();

        // Create a user with ID 42
        $user = new User();
        $userRef = new \ReflectionProperty(User::class, 'id');
        $userRef->setAccessible(true);
        $userRef->setValue($user, 42);
        $user->setEmail('test@example.com');

        $subject = new ParticipationApi();
        $subject->user = new UserRef();
        $subject->user->id = 42; // Same ID as the user

        $token = new UsernamePasswordToken($user, 'main');

        $ref = new \ReflectionMethod(ParticipationVoter::class, 'voteOnAttribute');
        $ref->setAccessible(true);

        $this->assertTrue($ref->invoke($voter, 'PARTICIPATION_VIEW', $subject, $token));
    }

    public function testParticipationVoterDeniesAccessForOtherUser(): void
    {
        $voter = new ParticipationVoter();

        $user = new User();
        $userIdRef = new \ReflectionProperty(User::class, 'id');
        $userIdRef->setAccessible(true);
        $userIdRef->setValue($user, 99);
        $user->setEmail('other@example.com');

        $subject = new ParticipationApi();
        $subject->user = new UserRef();
        $subject->user->id = 42; // Different from user ID 99

        $token = new UsernamePasswordToken($user, 'main');

        $ref = new \ReflectionMethod(ParticipationVoter::class, 'voteOnAttribute');
        $ref->setAccessible(true);

        $this->assertFalse($ref->invoke($voter, 'PARTICIPATION_VIEW', $subject, $token));
    }

    // ───────────────── UserVoter ─────────────────

    public function testUserVoterSupportsTrueForViewAttribute(): void
    {
        $voter = new UserVoter();
        $subject = new UserApi();

        $ref = new \ReflectionMethod(UserVoter::class, 'supports');
        $ref->setAccessible(true);

        $this->assertTrue($ref->invoke($voter, 'USER_VIEW', $subject));
    }

    public function testUserVoterGrantsAccessForOwner(): void
    {
        $voter = new UserVoter();

        $user = new User();
        $user->setEmail('owner@example.com');

        $subject = new UserApi();
        $subject->email = 'owner@example.com'; // Same email

        $token = new UsernamePasswordToken($user, 'main');

        $ref = new \ReflectionMethod(UserVoter::class, 'voteOnAttribute');
        $ref->setAccessible(true);

        $this->assertTrue($ref->invoke($voter, 'USER_VIEW', $subject, $token));
    }

    public function testUserVoterDeniesAccessForDifferentEmail(): void
    {
        $voter = new UserVoter();

        $user = new User();
        $user->setEmail('owner@example.com');

        $subject = new UserApi();
        $subject->email = 'someone-else@example.com'; // Different email

        $token = new UsernamePasswordToken($user, 'main');

        $ref = new \ReflectionMethod(UserVoter::class, 'voteOnAttribute');
        $ref->setAccessible(true);

        $this->assertFalse($ref->invoke($voter, 'USER_VIEW', $subject, $token));
    }
}
