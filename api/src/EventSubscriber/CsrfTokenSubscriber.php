<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Double-submit cookie CSRF protection for public endpoints.
 *
 * The client must:
 * 1. Call GET /csrf-token to obtain a token (set in cookie XSRF-TOKEN)
 * 2. Send the token value back in the X-XSRF-TOKEN header on protected requests
 *
 * The subscriber verifies that the header matches the cookie.
 */
final readonly class CsrfTokenSubscriber implements EventSubscriberInterface
{
    private const COOKIE_NAME = 'XSRF-TOKEN';
    private const HEADER_NAME = 'X-XSRF-TOKEN';

    /** @var list<array{method: string, pattern: string}> */
    private const PROTECTED_ROUTES = [
        ['method' => 'POST', 'pattern' => '#^/race_medias$#'],
    ];

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onKernelRequest', 10],
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        $method = $request->getMethod();
        $path = $request->getPathInfo();

        $isProtected = false;
        foreach (self::PROTECTED_ROUTES as $route) {
            if ($route['method'] === $method && preg_match($route['pattern'], $path)) {
                $isProtected = true;
                break;
            }
        }

        if (!$isProtected) {
            return;
        }

        $cookieToken = $request->cookies->get(self::COOKIE_NAME);
        $headerToken = $request->headers->get(self::HEADER_NAME);

        if (!$cookieToken || !$headerToken || !hash_equals($cookieToken, $headerToken)) {
            throw new AccessDeniedHttpException('Invalid or missing CSRF token.');
        }
    }
}
