<?php

namespace App\EventSubscriber;

use ApiPlatform\Validator\ValidatorInterface;
use CoopTilleuls\ForgotPasswordBundle\Event\CreateTokenEvent;
use CoopTilleuls\ForgotPasswordBundle\Event\UpdatePasswordEvent;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Twig\Environment;

final class ForgotPasswordEventSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly ValidatorInterface $validator,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly MailerInterface $mailer,
        private readonly Environment $twig,
        #[Autowire(env: 'FRONTEND_BASE_URL')]
        private readonly string $frontendUrl,
        #[Autowire(env: 'MAILER_SENDER')]
        private readonly string $mailerSender,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            CreateTokenEvent::class => 'onCreateToken',
            UpdatePasswordEvent::class => 'onUpdatePassword',
        ];
    }

    public function onCreateToken(CreateTokenEvent $event): void
    {
        $passwordToken = $event->getPasswordToken();
        $user = $passwordToken->getUser();

        $resetUrl = sprintf('%s/forgot-password/%s', rtrim($this->frontendUrl, '/'), $passwordToken->getToken());

        $message = (new Email())
            ->from($this->mailerSender)
            ->to($user->getEmail())
            ->subject('Réinitialisez votre mot de passe')
            ->html($this->twig->render('email/reset_password.html.twig', [
                'user' => $user,
                'reset_password_url' => $resetUrl,
            ]));

        $this->mailer->send($message);
    }

    public function onUpdatePassword(UpdatePasswordEvent $event): void
    {
        $passwordToken = $event->getPasswordToken();
        $user = $passwordToken->getUser();

        $user->setPlainPassword($event->getPassword());
        $this->validator->validate($user); // throws an Exception if invalid

        $hashedPassword = $this->passwordHasher->hashPassword(
            $user,
            $user->getPlainPassword()
        );
        $user->setPassword($hashedPassword);
        $user->eraseCredentials();
        $this->entityManager->persist($user);
    }
}
