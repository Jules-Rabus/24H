<?php

namespace App\Tests\Functional\Api\Command;

use App\Factory\UserFactory;
use App\Repository\UserRepository;
use App\Tests\Functional\Api\AbstractTestCase;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Tester\CommandTester;

/**
 * Covers CreateUserCommand (app:create-user).
 */
final class CreateUserCommandTest extends AbstractTestCase
{
    private function getCommandTester(): CommandTester
    {
        $application = new Application(static::$kernel);

        $command = $application->find('app:create-user');

        return new CommandTester($command);
    }

    public function testCreateNewUser(): void
    {
        $tester = $this->getCommandTester();

        $tester->execute([
            'email' => 'newuser@example.com',
            'firstName' => 'Test',
            'lastName' => 'User',
            'password' => 'password123',
        ]);

        $tester->assertCommandIsSuccessful();
        $output = $tester->getDisplay();
        $this->assertStringContainsString('successfully created', $output);

        $repo = static::getContainer()->get(UserRepository::class);
        $user = $repo->findOneBy(['email' => 'newuser@example.com']);
        $this->assertNotNull($user);
        $this->assertSame('Test', $user->getFirstName());
        $this->assertSame('User', $user->getLastName());
    }

    public function testCreateAdminUser(): void
    {
        $tester = $this->getCommandTester();

        $tester->execute([
            'email' => 'admin2@example.com',
            'firstName' => 'Admin',
            'lastName' => 'User',
            'password' => 'password123',
            '--admin' => true,
        ]);

        $tester->assertCommandIsSuccessful();

        $repo = static::getContainer()->get(UserRepository::class);
        $user = $repo->findOneBy(['email' => 'admin2@example.com']);
        $this->assertNotNull($user);
        $this->assertContains('ROLE_ADMIN', $user->getRoles());
    }

    public function testFailsWhenUserExistsWithoutUpdate(): void
    {
        UserFactory::createOne(['email' => 'existing@example.com']);

        $tester = $this->getCommandTester();

        $status = $tester->execute([
            'email' => 'existing@example.com',
            'firstName' => 'New',
            'lastName' => 'Name',
            'password' => 'password123',
        ]);

        $this->assertSame(1, $status); // Command::FAILURE
        $output = $tester->getDisplay();
        $this->assertStringContainsString('already exists', $output);
    }

    public function testUpdatesExistingUserWithUpdateFlag(): void
    {
        UserFactory::createOne([
            'email' => 'update@example.com',
            'firstName' => 'OldFirst',
            'lastName' => 'OldLast',
        ]);

        $tester = $this->getCommandTester();

        $tester->execute([
            'email' => 'update@example.com',
            'firstName' => 'NewFirst',
            'lastName' => 'NewLast',
            'password' => 'newpassword',
            '--update' => true,
        ]);

        $tester->assertCommandIsSuccessful();
        $output = $tester->getDisplay();
        $this->assertStringContainsString('successfully updated', $output);

        $repo = static::getContainer()->get(UserRepository::class);
        $user = $repo->findOneBy(['email' => 'update@example.com']);
        $this->assertNotNull($user);
        $this->assertSame('NewFirst', $user->getFirstName());
    }
}
