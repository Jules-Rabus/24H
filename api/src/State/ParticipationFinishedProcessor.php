<?php
namespace App\State;

use App\Repository\ParticipationRepository;
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
        private readonly ParticipationRepository $partRepo,
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

        $participation = $this->partRepo->findOneBy(
            ['user' => $user, 'arrivalTime' => null],
            ['run' => 'DESC']
        );
        if (null === $participation) {
            throw new BadRequestHttpException('Aucune participation en cours pour cet utilisateur');
        }
        $run   = $participation->getRun();
        $start = $run->getStartDate();
        $now   = new \DateTime();

        if ($start > $now) {
            throw new BadRequestHttpException('Le run n\'a pas encore commencé.');
        }

        $participation->setArrivalTime($now);

        $this->em->persist($participation);
        $this->em->flush();

        return $participation;
    }
}
