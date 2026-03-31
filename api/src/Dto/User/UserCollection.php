<?php

namespace App\Dto\User;

use App\Dto\Participation\ParticipationPublic;
use App\Entity\User;
use App\ObjectMapper\AverageTimeTransformer;
use App\ObjectMapper\BestTimeTransformer;
use App\ObjectMapper\ParticipationPublicCollectionTransformer;
use App\ObjectMapper\TotalTimeTransformer;
use App\ObjectMapper\UserImageUrlTransformer;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[Map(source: User::class)]
final class UserCollection
{
    public int $id;

    public string $firstName;

    public string $lastName;

    public ?string $surname = null;

    public ?string $email = null;

    public ?string $organization = null;

    #[Map(transform: UserImageUrlTransformer::class)]
    public ?string $image = null;

    /** @var list<ParticipationPublic> */
    #[Map(transform: ParticipationPublicCollectionTransformer::class)]
    public array $participations = [];

    #[Map(source: 'finishedParticipationsCount')]
    public int $finishedParticipationsCount = 0;

    #[Map(source: 'finishedParticipations', transform: TotalTimeTransformer::class)]
    public ?int $totalTime = null;

    #[Map(source: 'finishedParticipations', transform: BestTimeTransformer::class)]
    public ?int $bestTime = null;

    #[Map(source: 'finishedParticipations', transform: AverageTimeTransformer::class)]
    public ?int $averageTime = null;
}
