<?php

namespace App\Security\Voter;

use ApiPlatform\Metadata\IriConverterInterface;
use App\ApiResource\Participation\ParticipationApi;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

/** @extends Voter<string, ParticipationApi> */
final class ParticipationVoter extends Voter
{
    public const string VIEW = 'PARTICIPATION_VIEW';

    public function __construct(private readonly IriConverterInterface $iriConverter)
    {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $attribute === self::VIEW && $subject instanceof ParticipationApi;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $currentUser = $token->getUser();
        if (!$currentUser instanceof User) {
            return false;
        }

        /** @var ParticipationApi $subject */
        $userIri = $this->iriConverter->getIriFromResource($currentUser);

        return $subject->user === $userIri;
    }
}
