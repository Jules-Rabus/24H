<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-user',
    description: 'Creates a new user with hashed password'
)]
class CreateUserCommand extends \Symfony\Component\Console\Command\Command
{
    private EntityManagerInterface $em;
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher
    ) {
        parent::__construct();

        $this->em = $em;
        $this->passwordHasher = $passwordHasher;
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'Email of the new user')
            ->addArgument('firstName', InputArgument::REQUIRED, 'First name')
            ->addArgument('lastName', InputArgument::REQUIRED, 'Last name')
            ->addArgument('password', InputArgument::REQUIRED, 'Plain password')
            ->addOption('admin', null, InputArgument::OPTIONAL, 'Grant ROLE_ADMIN', false)
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $email = $input->getArgument('email');
        $firstName = $input->getArgument('firstName');
        $lastName = $input->getArgument('lastName');
        $plainPassword = $input->getArgument('password');
        $isAdmin = (bool) $input->getOption('admin');

        // Check if user already exists
        $existing = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);
        if ($existing) {
            $io->error(sprintf('A user with email "%s" already exists.', $email));
            return Command::FAILURE;
        }

        // Create and populate User entity
        $user = new User();
        $user->setEmail($email);
        $user->setFirstName($firstName);
        $user->setLastName($lastName);

        if ($isAdmin) {
            $user->setRoles(['ROLE_ADMIN']);
        }

        // Hash the password
        $hashed = $this->passwordHasher->hashPassword($user, $plainPassword);
        $user->setPassword($hashed);

        // Persist
        $this->em->persist($user);
        $this->em->flush();

        $io->success(sprintf('User "%s" successfully created.', $email));
        return Command::SUCCESS;
    }
}
