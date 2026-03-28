<?php

namespace App\Dto\Participation;

use App\ApiResource\Run\RunApi;
use App\ApiResource\User\UserApi;
use App\Entity\Participation;
use App\ObjectMapper\RelationTransformer;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[Map(target: Participation::class)]
final class CreateParticipation
{
    #[Map(transform: RelationTransformer::class)]
    public ?RunApi $run = null;

    #[Map(transform: RelationTransformer::class)]
    public ?UserApi $user = null;

    public ?\DateTimeInterface $arrivalTime = null;
}
