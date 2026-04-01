<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\RaceMedia;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @implements ProcessorInterface<RaceMedia, RaceMedia>
 */
final readonly class RaceMediaLikeProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): RaceMedia
    {
        $raceMedia = $this->entityManager->getRepository(RaceMedia::class)->find($uriVariables['id']);

        if (!$raceMedia) {
            throw new \RuntimeException('RaceMedia not found');
        }

        $raceMedia->likesCount = $raceMedia->likesCount + 1;
        $this->entityManager->flush();

        return $raceMedia;
    }
}
