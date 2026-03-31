<?php

namespace App\Security\Voter;

use App\ApiResource\User\UserApi;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

/** @extends Voter<string, UserApi> */
final class UserVoter extends Voter
{
    public const string VIEW = 'USER_VIEW';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return self::VIEW === $attribute && $subject instanceof UserApi;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $currentUser = $token->getUser();
        if (!$currentUser instanceof UserInterface) {
            return false;
        }

        /** @var UserApi $subject */
        return (string) $subject->email === $currentUser->getUserIdentifier();
    }
}
