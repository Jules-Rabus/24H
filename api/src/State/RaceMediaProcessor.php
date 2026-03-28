<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\RaceMedia as RaceMediaEntity;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * @implements ProcessorInterface<RaceMediaEntity, RaceMediaEntity>
 */
final readonly class RaceMediaProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private RequestStack $requestStack,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): RaceMediaEntity
    {
        $request = $this->requestStack->getCurrentRequest();
        if (null === $request) {
            throw new BadRequestException('Request is null');
        }

        $file = $request->files->get('file');
        if (!$file) {
            throw new BadRequestException('File is required');
        }

        $runnerIri = $request->request->get('runner');
        if (!$runnerIri) {
            throw new BadRequestException('Runner IRI is required');
        }

        // Extract ID from IRI (e.g., /users/1 -> 1)
        preg_match('/\/users\/(\d+)/', $runnerIri, $matches);
        $runnerId = $matches[1] ?? null;

        if (!$runnerId) {
            throw new BadRequestException('Invalid runner IRI');
        }

        $user = $this->entityManager->getRepository(User::class)->find($runnerId);
        if (!$user) {
            throw new BadRequestException('User not found');
        }

        $raceMedia = new RaceMediaEntity();
        $raceMedia->setFile($file);
        $raceMedia->setRunner($user);

        $this->entityManager->persist($raceMedia);
        $this->entityManager->flush();

        return $raceMedia;
    }
}
