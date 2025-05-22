<?php
namespace App\State;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

final class ParticipationFinishedProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserRepository $userRepo,
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {

        $payload = json_decode($data->rawValue, true, 512, JSON_THROW_ON_ERROR);
        if (!isset($payload['originId'])) {
            throw new BadRequestHttpException('Missing originId');
        }
        $userId = (int) $payload['originId'];

        $user = $this->userRepo->find($userId);
        if (null === $user) {
            throw new NotFoundHttpException("Utilisateur #$userId introuvable");
        }

        $now = new \DateTime();

        $currentParticipation = null;
        foreach ($user->getParticipations() as $participation) {
            $run = $participation->getRun();
            if (
                $run->getStartDate() <= $now &&
                $run->getEndDate() >  $now &&
                $participation->getArrivalTime() === null
            ) {
                $currentParticipation = $participation;
                break;
            }
        }

        if (null === $currentParticipation) {
            throw new BadRequestHttpException("Aucune participation en cours pour l'utilisateur : " . $user->getFirstName() . " " . $user->getLastName());
        }

        $participation->setArrivalTime($now);

        $this->em->persist($participation);
        $this->em->flush();

        return $participation;
    }
}
