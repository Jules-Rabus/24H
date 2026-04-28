<?php

namespace App\Tests\Functional\Api\User;

use App\Entity\Participation;
use App\Entity\User;
use App\Factory\RunFactory;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;
use Doctrine\ORM\EntityManagerInterface;

final class UserCreationByEditionTest extends AbstractTestCase
{
    private const string ROUTE = '/users';

    private function postUser(string $firstName, string $lastName): array
    {
        $response = $this->createClientWithCredentials()->request('POST', self::ROUTE, [
            'headers' => ['Content-Type' => 'application/json', 'Accept' => 'application/json'],
            'json' => [
                'firstName' => $firstName,
                'lastName' => $lastName,
                'roles' => ['ROLE_USER'],
            ],
        ]);

        return $response->toArray(false) + ['__status' => $response->getStatusCode()];
    }

    /** @return list<Participation> */
    private function findUserParticipations(int $userId): array
    {
        /** @var EntityManagerInterface $em */
        $em = static::getContainer()->get(EntityManagerInterface::class);
        $em->clear();
        $user = $em->find(User::class, $userId);

        return null === $user ? [] : array_values($user->getParticipations()->toArray());
    }

    public function testCreatedUserGetsParticipationForCurrentRun(): void
    {
        $run = RunFactory::createOne([
            'startDate' => new \DateTime('-1 hour'),
            'endDate' => new \DateTime('+1 hour'),
        ]);

        $data = $this->postUser('Alice', 'Current');
        $this->assertSame(201, $data['__status']);

        $participations = $this->findUserParticipations((int) $data['id']);
        $this->assertCount(1, $participations);
        $this->assertSame($run->getId(), $participations[0]->getRun()->getId());
    }

    public function testCreatedUserPicksUpcomingRunWhenNoCurrent(): void
    {
        RunFactory::createOne([
            'startDate' => new \DateTime('-2 days'),
            'endDate' => new \DateTime('-1 day'),
        ]);
        $upcoming = RunFactory::createOne([
            'startDate' => new \DateTime('+1 day'),
            'endDate' => new \DateTime('+2 days'),
        ]);

        $data = $this->postUser('Bob', 'Upcoming');
        $this->assertSame(201, $data['__status']);

        $participations = $this->findUserParticipations((int) $data['id']);
        $this->assertCount(1, $participations);
        $this->assertSame($upcoming->getId(), $participations[0]->getRun()->getId());
    }

    public function testCreatedUserFallsBackToMostRecentRunWhenAllPast(): void
    {
        RunFactory::createOne([
            'startDate' => new \DateTime('-10 days'),
            'endDate' => new \DateTime('-9 days'),
        ]);
        $mostRecent = RunFactory::createOne([
            'startDate' => new \DateTime('-3 days'),
            'endDate' => new \DateTime('-2 days'),
        ]);

        $data = $this->postUser('Carol', 'Past');
        $this->assertSame(201, $data['__status']);

        $participations = $this->findUserParticipations((int) $data['id']);
        $this->assertCount(1, $participations);
        $this->assertSame($mostRecent->getId(), $participations[0]->getRun()->getId());
    }

    public function testCreatedUserHasNoParticipationWhenNoRun(): void
    {
        $data = $this->postUser('Dave', 'NoRun');
        $this->assertSame(201, $data['__status']);

        $participations = $this->findUserParticipations((int) $data['id']);
        $this->assertCount(0, $participations);
    }

    public function testCreatingDuplicateNameReturns422(): void
    {
        UserFactory::createOne(['firstName' => 'Jean', 'lastName' => 'Dupont']);

        $data = $this->postUser('Jean', 'Dupont');
        $this->assertSame(422, $data['__status']);
        $this->assertResponseStatusCodeSame(422);
    }

    public function testCreatingUserWithImageUploadAfterwards(): void
    {
        RunFactory::createOne([
            'startDate' => new \DateTime('-1 hour'),
            'endDate' => new \DateTime('+1 hour'),
        ]);

        $created = $this->postUser('Eve', 'WithPhoto');
        $this->assertSame(201, $created['__status']);
        $userId = (int) $created['id'];

        $tmp = tempnam(sys_get_temp_dir(), 'user_img_').'.png';
        // 1x1 PNG
        file_put_contents($tmp, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='));

        $this->createClientWithCredentials()->request('POST', "/users/$userId/image", [
            'headers' => ['Content-Type' => 'multipart/form-data'],
            'extra' => [
                'files' => [
                    'file' => new \Symfony\Component\HttpFoundation\File\UploadedFile($tmp, 'test.png', 'image/png', null, true),
                ],
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
    }
}
