<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

final class SecurityController extends AbstractController
{
    public function __construct(
        #[Autowire(env: 'JWT_COOKIE_NAME')]
        private readonly string $jwtCookieName,
    ) {
    }

    public function logout(): Response
    {
        $response = new JsonResponse([
            'message' => 'Logged out.',
        ]);

        $response->headers->clearCookie(
            $this->jwtCookieName,
            '/',
            null,
            true,
            true,
            Cookie::SAMESITE_STRICT,
        );

        return $response;
    }
}
