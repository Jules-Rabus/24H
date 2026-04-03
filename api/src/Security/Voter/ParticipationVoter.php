<?php

namespace App\Security\Voter;

use App\ApiResource\Participation\ParticipationApi;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

/** @extends Voter<string, ParticipationApi> */
final class ParticipationVoter extends Voter
{
    public const string VIEW = 'PARTICIPATION_VIEW';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return self::VIEW === $attribute && $subject instanceof ParticipationApi;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $currentUser = $token->getUser();
        if (!$currentUser instanceof User) {
            return false;
        }

        /** @var ParticipationApi $subject */
        return $subject->user->id === $currentUser->getId();
    }
}
