<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class CsrfTokenController extends AbstractController
{
    private const COOKIE_NAME = 'XSRF-TOKEN';

    #[Route('/csrf-token', name: 'csrf_token', methods: ['GET'])]
    public function __invoke(): JsonResponse
    {
        $token = bin2hex(random_bytes(32));

        $response = new JsonResponse(['token' => $token]);
        $response->headers->setCookie(
            Cookie::create(self::COOKIE_NAME)
                ->withValue($token)
                ->withPath('/')
                ->withSecure(true)
                ->withHttpOnly(false) // JS must read this cookie
                ->withSameSite(Cookie::SAMESITE_STRICT)
        );

        return $response;
    }
}
