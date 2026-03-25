<?php

namespace App\Tests\Functional\Api\ForgotPassword;

use App\Entity\PasswordToken;
use App\Factory\UserFactory;
use App\Tests\Functional\Api\AbstractTestCase;
use Doctrine\ORM\EntityManagerInterface;

final class ForgotPasswordTest extends AbstractTestCase
{
    private const string ROUTE = '/forgot-password/';

    // POST /forgot-password/ — email connu → 201 + mail envoyé
    public function testRequestPasswordResetWithKnownEmail(): void
    {
        $client = static::createClient();
        $user = UserFactory::createOne(['email' => 'runner@example.com', 'password' => '$3cr3t']);

        $client->request('POST', self::ROUTE, [
            'headers' => ['Content-Type' => 'application/json'],
            'json' => ['email' => $user->getEmail()],
        ]);

        $this->assertResponseStatusCodeSame(204);
        $this->assertEmailCount(1);

        $email = $this->getMailerMessage();
        $this->assertEmailAddressContains($email, 'to', 'runner@example.com');
        $this->assertEmailHtmlBodyContains($email, 'forgot-password');
    }

    // POST /forgot-password/ — email inconnu → 201 (pas de fuite d'info)
    public function testRequestPasswordResetWithUnknownEmail(): void
    {
        $client = static::createClient();

        $client->request('POST', self::ROUTE, [
            'headers' => ['Content-Type' => 'application/json'],
            'json' => ['email' => 'unknown@example.com'],
        ]);

        $this->assertResponseStatusCodeSame(204);
        $this->assertEmailCount(0);
    }

    // GET /forgot-password/{token} — token valide → 200
    public function testGetValidToken(): void
    {
        $client = static::createClient();
        $user = UserFactory::createOne(['email' => 'runner@example.com', 'password' => '$3cr3t']);

        // Déclenche la création du token
        $client->request('POST', self::ROUTE, [
            'headers' => ['Content-Type' => 'application/json'],
            'json' => ['email' => $user->getEmail()],
        ]);
        $this->assertResponseStatusCodeSame(204);

        // Récupère le token en base
        $em = static::getContainer()->get(EntityManagerInterface::class);
        /** @var PasswordToken $token */
        $token = $em->getRepository(PasswordToken::class)->findOneBy([]);
        $this->assertNotNull($token);

        $client->request('GET', self::ROUTE.$token->getToken());
        $this->assertResponseStatusCodeSame(200);
    }

    // GET /forgot-password/{token} — token invalide → 404
    public function testGetInvalidToken(): void
    {
        $client = static::createClient();

        $client->request('GET', self::ROUTE.'invalid-token-value');
        $this->assertResponseStatusCodeSame(404);
    }

    // POST /forgot-password/{token} — réinitialisation valide → 200 + mot de passe changé
    public function testResetPasswordWithValidToken(): void
    {
        $client = static::createClient();
        $user = UserFactory::createOne(['email' => 'runner@example.com', 'password' => '$3cr3t']);

        $client->request('POST', self::ROUTE, [
            'headers' => ['Content-Type' => 'application/json'],
            'json' => ['email' => $user->getEmail()],
        ]);
        $this->assertResponseStatusCodeSame(204);

        $em = static::getContainer()->get(EntityManagerInterface::class);
        /** @var PasswordToken $token */
        $token = $em->getRepository(PasswordToken::class)->findOneBy([]);

        $client->request('POST', self::ROUTE.$token->getToken(), [
            'headers' => ['Content-Type' => 'application/json'],
            'json' => ['password' => 'N0uveauMotDePasse!'],
        ]);

        $this->assertResponseStatusCodeSame(204);

        // Vérifie que le nouveau mot de passe fonctionne au login
        $response = $client->request('POST', '/login', [
            'headers' => ['Content-Type' => 'application/json'],
            'json' => ['email' => 'runner@example.com', 'password' => 'N0uveauMotDePasse!'],
        ]);
        $this->assertResponseIsSuccessful();
        $this->assertArrayHasKey('token', $response->toArray(false));
    }

    // POST /forgot-password/{token} — token invalide → 404
    public function testResetPasswordWithInvalidToken(): void
    {
        $client = static::createClient();

        $client->request('POST', self::ROUTE.'invalid-token-value', [
            'headers' => ['Content-Type' => 'application/json'],
            'json' => ['password' => 'N0uveauMotDePasse!'],
        ]);

        $this->assertResponseStatusCodeSame(404);
    }
}
