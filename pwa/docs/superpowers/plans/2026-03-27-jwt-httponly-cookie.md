# JWT HttpOnly Cookie Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supprimer tout accès à `localStorage` pour le token JWT et utiliser exclusivement le cookie HttpOnly `BEARER` émis par le backend Symfony.

**Architecture:** Le backend Symfony est déjà configuré pour émettre un cookie `BEARER` HttpOnly/Secure/SameSite=Strict via `lexik_jwt_authentication.yaml`. Il suffit côté PWA de : (1) activer `withCredentials`/`credentials: "include"` sur tous les clients HTTP, (2) supprimer les lectures/écritures `localStorage`, (3) remplacer la détection d'auth par une API `/me` (ou vérifier la présence du cookie côté serveur), et (4) mettre à jour les legacy pages qui lisaient le token directement.

**Tech Stack:** Next.js App Router, axios, hey-api generated client, LexikJWTAuthenticationBundle (Symfony), `credentials: "include"` (fetch standard)

---

## Contexte important

Le backend répond au login (`POST /login`) avec :
- **Body JSON** : `{ "token": "..." }` (car `remove_token_from_body_when_cookies_used: false`)
- **Cookie** : `BEARER=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/`

Le token extractor est configuré pour lire depuis le cookie `BEARER`. Donc si la PWA envoie les cookies avec chaque requête (`withCredentials: true`), le backend accepte automatiquement l'auth — plus besoin d'injecter le header `Authorization`.

---

## File Map

| Fichier | Action | Rôle |
|---|---|---|
| `pwa/src/api/client.ts` | Modifier | Supprimer intercepteur `Authorization`, ajouter `withCredentials: true` |
| `pwa/src/api/sdk-client.ts` | Modifier | Supprimer `auth: () => localStorage.getItem(...)`, ajouter `credentials: "include"` |
| `pwa/src/state/auth/mutations.ts` | Modifier | Supprimer `localStorage.setItem` dans `onSuccess` |
| `pwa/src/state/auth/schemas.ts` | Modifier | Ajouter schema `meResponseSchema` |
| `pwa/src/state/auth/queries.ts` | Créer | Query `useMe` pour vérifier l'auth via `/api/me` ou `/users/me` |
| `pwa/components/utils/providers.tsx` | Modifier | Supprimer tous les `localStorage`, utiliser `useMe` query pour détecter l'auth |
| `pwa/app/legacy/display/page.tsx` | Modifier | Supprimer `Authorization` header, utiliser `withCredentials` |
| `pwa/app/legacy/scanner/index.tsx` | Modifier | Supprimer token localStorage, utiliser `withCredentials` |
| `pwa/app/legacy/display/index.tsx` | Modifier | Supprimer token localStorage + `Authorization` header |
| `api/config/packages/lexik_jwt_authentication.yaml` | Modifier | Passer `remove_token_from_body_when_cookies_used: true` |
| `api/config/packages/security.yaml` | Vérifier | S'assurer que CORS permet credentials |
| `api/config/packages/framework.yaml` ou `nelmio_cors` | Vérifier | `allow_credentials: true` dans CORS |

---

## Task 1 — API Symfony : activer CORS credentials et supprimer le token du body

**Fichiers :**
- Modifier : `api/config/packages/lexik_jwt_authentication.yaml`
- Vérifier/Modifier : `api/config/packages/nelmio_cors.yaml` (ou équivalent CORS)

### Contexte
Pour que le navigateur envoie le cookie `BEARER` en cross-origin (PWA sur `https://localhost` → API sur `https://localhost`), il faut `Access-Control-Allow-Credentials: true` côté API. Ici l'API et la PWA sont sur le même domaine (`localhost`) derrière Caddy, donc SameSite=Strict fonctionne déjà — les cookies sont envoyés automatiquement.

- [ ] **Step 1 : Passer `remove_token_from_body_when_cookies_used: true`**

Dans `api/config/packages/lexik_jwt_authentication.yaml`, changer :
```yaml
remove_token_from_body_when_cookies_used: false
```
en :
```yaml
remove_token_from_body_when_cookies_used: true
```

Cela force le backend à NE PAS inclure le token dans le body JSON — on se base uniquement sur le cookie.

- [ ] **Step 2 : Vérifier la config CORS**

```bash
cat api/config/packages/nelmio_cors.yaml 2>/dev/null || grep -r "allow_credentials\|Access-Control" api/config/ 2>/dev/null | head -20
```

Si `nelmio/cors-bundle` est présent, s'assurer que `allow_credentials: true` est configuré pour les origines autorisées.

- [ ] **Step 3 : Redémarrer le container API et vérifier**

```bash
docker compose restart api
docker compose exec api php bin/console cache:clear
```

Tester manuellement :
```bash
curl -k -X POST https://localhost/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin"}' \
  -v 2>&1 | grep -E "Set-Cookie|BEARER|token"
```

Résultat attendu : un header `Set-Cookie: BEARER=<jwt>; HttpOnly...` et pas de `token` dans le body JSON.

- [ ] **Step 4 : Commit**

```bash
git add api/config/packages/lexik_jwt_authentication.yaml
git commit -m "feat(api): remove JWT token from body, cookie-only auth"
```

---

## Task 2 — Supprimer `localStorage` du client axios (`src/api/client.ts`)

**Fichiers :**
- Modifier : `pwa/src/api/client.ts`

### Contexte
`client.ts` est l'instance axios utilisée par les pages legacy (display, scanner). L'intercepteur injecte le header `Authorization: Bearer <token>` depuis `localStorage`. Avec le cookie HttpOnly, axios doit juste envoyer `withCredentials: true` et le navigateur joint automatiquement le cookie.

- [ ] **Step 1 : Réécrire `pwa/src/api/client.ts`**

```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ENTRYPOINT ?? 'http://localhost',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
```

L'intercepteur entier est supprimé — plus de lecture `localStorage`.

- [ ] **Step 2 : Vérifier qu'aucun autre fichier n'importe `apiClient` avec une attente sur `Authorization`**

```bash
grep -rn "apiClient" pwa/src/ pwa/app/ pwa/components/ | grep -v node_modules
```

- [ ] **Step 3 : Commit**

```bash
git add pwa/src/api/client.ts
git commit -m "feat(pwa): use withCredentials in axios client, remove localStorage token"
```

---

## Task 3 — Supprimer `localStorage` du client hey-api (`src/api/sdk-client.ts`)

**Fichiers :**
- Modifier : `pwa/src/api/sdk-client.ts`

### Contexte
`sdk-client.ts` configure le client hey-api généré. L'option `auth` injecte le token Bearer. Avec les cookies, il faut supprimer `auth` et ajouter `credentials: "include"` dans la config fetch underlyante.

- [ ] **Step 1 : Réécrire `pwa/src/api/sdk-client.ts`**

```typescript
/**
 * Initialise le client hey-api avec la baseURL et les cookies HttpOnly.
 * Le token JWT est envoyé automatiquement via le cookie BEARER.
 */
import { client } from "./generated/client.gen"

client.setConfig({
  baseURL: process.env.NEXT_PUBLIC_ENTRYPOINT ?? "http://localhost",
  throwOnError: true,
  credentials: "include",
})

export { client }
```

- [ ] **Step 2 : Commit**

```bash
git add pwa/src/api/sdk-client.ts
git commit -m "feat(pwa): use cookie credentials in hey-api SDK client"
```

---

## Task 4 — Supprimer `localStorage.setItem` dans `mutations.ts`

**Fichiers :**
- Modifier : `pwa/src/state/auth/mutations.ts`

### Contexte
Après un login réussi, `onSuccess` faisait `localStorage.setItem("token", data.token)`. Maintenant le cookie est déjà posé par le Set-Cookie du backend — `onSuccess` ne fait plus rien avec le token.

- [ ] **Step 1 : Réécrire `pwa/src/state/auth/mutations.ts`**

```typescript
import { useMutation } from "@tanstack/react-query"
import { loginCheckPost, postForgotPassword } from "@/api/generated/sdk.gen"

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      await loginCheckPost({
        body: credentials,
      })
    },
  })
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      await postForgotPassword({
        body: payload,
      })
    },
  })
}
```

Note : on ne valide plus le body de login car `remove_token_from_body_when_cookies_used: true` → le body de réponse est vide. Le `loginResponseSchema` est donc inutilisé (le supprimer de `schemas.ts` aussi si nécessaire).

- [ ] **Step 2 : Nettoyer `pwa/src/state/auth/schemas.ts` si `loginResponseSchema` n'est plus utilisé**

Vérifier :
```bash
grep -rn "loginResponseSchema" pwa/src/ pwa/app/ pwa/components/
```

Si non utilisé ailleurs, supprimer la ligne dans `schemas.ts`.

- [ ] **Step 3 : Commit**

```bash
git add pwa/src/state/auth/mutations.ts pwa/src/state/auth/schemas.ts
git commit -m "feat(pwa): remove localStorage token storage after login"
```

---

## Task 5 — Créer une query `/me` pour détecter l'état d'authentification

**Fichiers :**
- Créer : `pwa/src/state/auth/queries.ts`

### Contexte
`providers.tsx` utilisait `localStorage.getItem("token")` pour savoir si l'utilisateur est connecté. Avec les cookies HttpOnly, le JS ne peut plus lire le cookie. La solution standard est d'appeler un endpoint `/api/me` (ou similaire) qui retourne 200 si le cookie est valide, 401 sinon.

Vérifier si l'endpoint existe côté API :
```bash
grep -rn "me\|profile\|current" api/src/Controller/ api/src/ | grep -i route | head -20
```

Si l'endpoint `/api/me` n'existe pas, le créer dans Symfony (voir Task 6). Sinon, utiliser l'endpoint existant.

- [ ] **Step 1 : Créer `pwa/src/state/auth/queries.ts`**

```typescript
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/api/client"
import { z } from "zod"

const meSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  roles: z.array(z.string()).optional(),
})

export type Me = z.infer<typeof meSchema>

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await apiClient.get<unknown>("/users/me")
      return meSchema.parse(data)
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
```

- [ ] **Step 2 : Commit**

```bash
git add pwa/src/state/auth/queries.ts
git commit -m "feat(pwa): add useMe query for cookie-based auth detection"
```

---

## Task 6 — Créer l'endpoint `/users/me` dans Symfony (si inexistant)

**Fichiers :**
- Créer : `api/src/Controller/MeController.php` (ou via ApiResource)

### Contexte
Vérifier d'abord si l'endpoint existe :
```bash
docker compose exec api php bin/console debug:router | grep -i me
```

- [ ] **Step 1 : Vérifier si `/users/me` ou `/api/me` existe**

```bash
docker compose exec api php bin/console debug:router 2>/dev/null | grep -i "me\|profile\|current_user"
```

Si le résultat montre un endpoint `/users/me` ou similaire → passer à Task 7 directement.

- [ ] **Step 2 : Si absent, créer `api/src/ApiResource/MeResource.php`**

Ajouter via annotation ApiPlatform sur l'entité `User` :

Dans `api/src/Entity/User.php`, ajouter une opération GET custom :
```php
#[ApiResource(
    operations: [
        // ... existing operations
        new Get(
            uriTemplate: '/users/me',
            controller: MeController::class,
            read: false,
            security: "is_granted('ROLE_USER')",
            name: 'me',
        ),
    ]
)]
```

Créer `api/src/Controller/MeController.php` :
```php
<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Entity\User;

class MeController extends AbstractController
{
    public function __invoke(#[CurrentUser] User $user): User
    {
        return $user;
    }
}
```

- [ ] **Step 3 : Tester l'endpoint**

```bash
# Login pour obtenir le cookie
curl -k -c /tmp/cookies.txt -X POST https://localhost/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin"}' -s

# Appeler /users/me avec le cookie
curl -k -b /tmp/cookies.txt https://localhost/users/me -s | head -50
```

Résultat attendu : JSON avec l'objet User (id, email, roles, etc.)

- [ ] **Step 4 : Commit**

```bash
git add api/src/
git commit -m "feat(api): add GET /users/me endpoint for authenticated user info"
```

---

## Task 7 — Refactoriser `providers.tsx` pour supprimer tous les `localStorage`

**Fichiers :**
- Modifier : `pwa/components/utils/providers.tsx`

### Contexte
`providers.tsx` contient toute la logique auth legacy (`react-admin` / `@api-platform/admin`) : `getHeaders()`, `getAccessToken()`, `authProvider`, `RedirectToLogin`. Ces fonctions utilisent toutes `localStorage`. Le token étant maintenant dans un cookie HttpOnly, on ne peut plus le lire côté JS.

**Stratégie :**
- `getHeaders()` → retourner `{}` (le cookie est envoyé automatiquement par le navigateur)
- `getAccessToken()` → ne peut plus décoder le JWT (HttpOnly = inaccessible au JS). Supprimer.
- `authProvider.login()` → appeler `/login` avec `credentials: "include"`, ne plus stocker de token
- `authProvider.logout()` → appeler `POST /logout` (endpoint à vérifier dans Symfony) pour invalider le cookie, sinon juste rediriger
- `authProvider.checkAuth()` → appeler `/users/me` pour vérifier si le cookie est valide
- `RedirectToLogin` → vérifier l'auth via fetch `/users/me`

- [ ] **Step 1 : Vérifier si un endpoint `/logout` existe côté API**

```bash
docker compose exec api php bin/console debug:router 2>/dev/null | grep logout
```

Si absent : le logout côté client peut juste expirer le cookie en appelant un endpoint dédié, ou on peut créer un `LogoutController` Symfony simple (voir Step 2).

- [ ] **Step 2 : Créer `api/src/Controller/LogoutController.php` si nécessaire**

```php
<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class LogoutController extends AbstractController
{
    #[Route('/logout', name: 'api_logout', methods: ['POST'])]
    public function __invoke(): Response
    {
        $response = new Response(null, 204);
        $response->headers->clearCookie(
            name: $_ENV['JWT_COOKIE_NAME'] ?? 'BEARER',
            path: '/',
            domain: null,
            secure: true,
            httpOnly: true,
            sameSite: 'strict',
        );
        return $response;
    }
}
```

Ajouter la route dans `security.yaml` access_control :
```yaml
- { path: ^/logout, roles: PUBLIC_ACCESS }
```

- [ ] **Step 3 : Réécrire `pwa/components/utils/providers.tsx`**

```typescript
"use client";

import React from "react";
import {
  fetchHydra as baseFetchHydra,
  hydraDataProvider as baseHydraDataProvider,
  HydraHttpClientResponse,
  useIntrospection,
} from "@api-platform/admin";
import { parseHydraDocumentation } from "@api-platform/api-doc-parser";
import { API_AUTH_PATH, ENTRYPOINT } from "../../config/entrypoint";
import { Navigate } from "react-router-dom";

// Cookies are sent automatically — no Authorization header needed
export const getHeaders = (): Record<string, string> => ({});

export const fetchHydra = (
  url: string | URL,
  options: any = {},
): Promise<HydraHttpClientResponse> => {
  return baseFetchHydra(new URL(url), {
    ...options,
    credentials: "include",
    headers: {
      ...options.headers,
    },
  });
};

export const RedirectToLogin = () => {
  const introspect = useIntrospection();
  const [isAuth, setIsAuth] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    fetch(`${ENTRYPOINT}/users/me`, { credentials: "include" })
      .then((r) => {
        if (r.ok) {
          setIsAuth(true);
          introspect();
        } else {
          setIsAuth(false);
        }
      })
      .catch(() => setIsAuth(false));
  }, []);

  if (isAuth === null) return <></>;
  if (isAuth) return <></>;
  return <Navigate to="/login" />;
};

export const apiDocumentationParser =
  (setRedirectToLogin: (value: boolean) => void) => async () => {
    try {
      setRedirectToLogin(false);
      return await parseHydraDocumentation(ENTRYPOINT, {
        headers: getHeaders(),
        credentials: "include",
      });
    } catch (result: any) {
      const { api, response, status } = result;
      if (status !== 401 || !response) {
        console.error("Error fetching API documentation", result);
        throw result;
      }
      setRedirectToLogin(true);
      return { api, response, status };
    }
  };

export const dataProvider = (setRedirectToLogin: (value: boolean) => void) =>
  baseHydraDataProvider({
    entrypoint: ENTRYPOINT,
    httpClient: fetchHydra,
    apiDocumentationParser: apiDocumentationParser(setRedirectToLogin),
    useEmbedded: false,
  });

export const authProvider = {
  login: async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    const response = await fetch(API_AUTH_PATH, {
      method: "POST",
      body: JSON.stringify({ email: username, password }),
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "include",
    });
    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }
    return Promise.resolve();
  },

  logout: async () => {
    await fetch(`${ENTRYPOINT}/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    return Promise.resolve();
  },

  checkAuth: async () => {
    const response = await fetch(`${ENTRYPOINT}/users/me`, {
      credentials: "include",
    });
    if (!response.ok) return Promise.reject();
    return Promise.resolve();
  },

  checkError: (error: { status: number }) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getPermissions: () => Promise.resolve(""),
};
```

- [ ] **Step 4 : Commit**

```bash
git add pwa/components/utils/providers.tsx api/src/Controller/LogoutController.php api/config/packages/security.yaml
git commit -m "feat(pwa,api): replace localStorage with HttpOnly cookie auth in legacy providers"
```

---

## Task 8 — Supprimer `localStorage` des legacy pages (display, scanner)

**Fichiers :**
- Modifier : `pwa/app/legacy/display/page.tsx`
- Modifier : `pwa/app/legacy/display/index.tsx`
- Modifier : `pwa/app/legacy/scanner/index.tsx`

### Contexte
Ces pages faisaient un login explicite au chargement pour récupérer un token, puis l'injectaient dans les headers. Avec le cookie, si l'utilisateur est déjà connecté via le login page, le cookie est envoyé automatiquement. Il suffit d'activer `withCredentials: true` sur axios.

**Attention pour `display/page.tsx`** : la page se loggue avec des credentials "display" dédiés (`NEXT_PUBLIC_DISPLAY_EMAIL` / `NEXT_PUBLIC_DISPLAY_PASSWORD`) — cela reste valide, mais le login doit utiliser `withCredentials: true` pour que le cookie soit posé.

- [ ] **Step 1 : Réécrire `pwa/app/legacy/display/page.tsx`**

```typescript
"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import Display from "./index";

type Run = {
  id: number;
  startDate: string;
  endDate: string;
  participations: [string];
  finishedParticipantsCount: number;
  inProgressParticipantsCount: number;
  participantsCount: number;
};

type Participation = {
  id: number;
  arrivalTime?: string;
  totalTime?: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    surname?: string;
    finishedParticipationsCount: number;
  };
  run: string;
  status: string;
};

const displayClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ENTRYPOINT ?? "",
  withCredentials: true,
});

export default function DisplayPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const email = process.env.NEXT_PUBLIC_DISPLAY_EMAIL ?? "";
    const password = process.env.NEXT_PUBLIC_DISPLAY_PASSWORD ?? "";

    async function load() {
      try {
        // Login sets the BEARER cookie automatically
        await displayClient.post("/login", { email, password });

        const [runsResp, partResp] = await Promise.all([
          displayClient.get<{ member: Run[] }>("/runs", {
            params: { "order[startDate]": "asc" },
          }),
          displayClient.get<{ member: Participation[] }>("/participations", {
            params: { "order[arrivalTime]": "desc", itemsPerPage: 1000 },
          }),
        ]);

        setRuns(runsResp.data.member);
        setParticipations(
          partResp.data.member.filter((p) => p.status === "FINISHED"),
        );
      } catch (err) {
        console.error("[display] load error:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return <Display runs={runs} initialParticipations={participations} />;
}
```

- [ ] **Step 2 : Réécrire `pwa/app/legacy/display/index.tsx` — supprimer le login et les headers manuels**

Trouver les lignes qui font le login et injectent `Authorization` dans `display/index.tsx` et les remplacer par des appels axios avec `withCredentials: true`. Chercher :
```bash
grep -n "localStorage\|Authorization\|token\|login" pwa/app/legacy/display/index.tsx
```

Remplacer l'instance axios utilisée dans `index.tsx` par une qui a `withCredentials: true`. Si `index.tsx` crée son propre axios, le modifier pour utiliser `apiClient` de `src/api/client.ts` (qui a déjà `withCredentials: true` après Task 2).

- [ ] **Step 3 : Réécrire `pwa/app/legacy/scanner/index.tsx` — supprimer localStorage**

Dans `scanner/index.tsx` :
- Supprimer `const [token, setToken] = useState<string | null>(null)`
- Supprimer `useEffect(() => { setToken(localStorage.getItem("token")); }, [])`
- Supprimer le check `if (!token)` dans `handleScan`
- Remplacer l'appel axios par `apiClient` (qui a `withCredentials: true`) ou ajouter `withCredentials: true` à l'appel direct

```typescript
// Avant
const { data } = await axios.post<Participation>(
  `${process.env.NEXT_PUBLIC_ENTRYPOINT}/participations/finished`,
  { rawValue },
  { headers: { Authorization: `Bearer ${token}` } },
);

// Après
const { data } = await axios.post<Participation>(
  `${process.env.NEXT_PUBLIC_ENTRYPOINT}/participations/finished`,
  { rawValue },
  { withCredentials: true },
);
```

La vérification d'auth se fait maintenant côté serveur (401 si pas de cookie valide).

- [ ] **Step 4 : Commit**

```bash
git add pwa/app/legacy/display/page.tsx pwa/app/legacy/display/index.tsx pwa/app/legacy/scanner/index.tsx
git commit -m "feat(pwa): remove localStorage token from legacy display and scanner pages"
```

---

## Task 9 — Mettre à jour les tests unitaires

**Fichiers :**
- Modifier : `pwa/src/__tests__/login.test.tsx`
- Modifier : `pwa/src/mocks/handlers/auth.ts`

- [ ] **Step 1 : Mettre à jour le mock de login dans `pwa/src/mocks/handlers/auth.ts`**

Le handler de login devrait maintenant répondre sans body (ou body vide), car `remove_token_from_body_when_cookies_used: true`. Simuler aussi le Set-Cookie :

```typescript
// pwa/src/mocks/handlers/auth.ts
import { http, HttpResponse } from "msw"

export const authHandlers = [
  http.post("*/login", () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        "Set-Cookie": "BEARER=fake-jwt-token; HttpOnly; Path=/",
      },
    })
  }),

  http.post("*/logout", () => {
    return new HttpResponse(null, {
      status: 204,
      headers: {
        "Set-Cookie": "BEARER=; HttpOnly; Path=/; Max-Age=0",
      },
    })
  }),

  http.get("*/users/me", ({ request }) => {
    // Simuler l'auth par cookie présent
    return HttpResponse.json({
      id: 1,
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      roles: ["ROLE_ADMIN"],
    })
  }),
]
```

- [ ] **Step 2 : Mettre à jour `pwa/src/__tests__/login.test.tsx`**

Le test de login ne doit plus vérifier `localStorage.setItem` mais juste que la navigation post-login a bien lieu (cookie géré par le navigateur/JSDOM).

```typescript
// Remplacer l'assertion sur localStorage :
// expect(localStorage.setItem).toHaveBeenCalledWith("token", ...)
// Par :
expect(mockRouter.push).toHaveBeenCalledWith("/")
```

- [ ] **Step 3 : Lancer les tests**

```bash
docker compose exec pwa npm run test
```

Résultat attendu : tous les tests passent.

- [ ] **Step 4 : Commit**

```bash
git add pwa/src/__tests__/ pwa/src/mocks/handlers/
git commit -m "test(pwa): update auth tests for HttpOnly cookie flow"
```

---

## Task 10 — Vérification finale et build

- [ ] **Step 1 : Lancer le build complet**

```bash
docker compose run --rm pwa npm run build
```

Résultat attendu : `✓ Compiled successfully` sans erreurs TypeScript.

- [ ] **Step 2 : Test manuel de bout en bout**

1. Aller sur `https://localhost/login`
2. Se connecter → vérifier dans DevTools > Application > Cookies : `BEARER` présent avec `HttpOnly`
3. Vérifier que `localStorage` ne contient PAS de `token`
4. Naviguer sur `/legacy/admin` → doit fonctionner
5. Se déconnecter → cookie `BEARER` doit disparaître

- [ ] **Step 3 : Commit de vérification final si des ajustements ont été faits**

```bash
git add -p
git commit -m "fix(pwa): final adjustments for HttpOnly cookie migration"
```

---

## Checklist de couverture spec

- [x] Supprimer `localStorage.setItem("token", ...)` → Task 4
- [x] Supprimer `localStorage.getItem("token")` dans client.ts → Task 2
- [x] Supprimer `localStorage.getItem("token")` dans sdk-client.ts → Task 3
- [x] Supprimer `localStorage.*token*` dans providers.tsx → Task 7
- [x] Supprimer `localStorage.getItem("token")` dans scanner/index.tsx → Task 8
- [x] Activer `withCredentials: true` / `credentials: "include"` partout → Tasks 2, 3, 7, 8
- [x] Endpoint `/users/me` pour détecter l'auth sans lire le cookie → Tasks 5, 6
- [x] Endpoint `/logout` pour supprimer le cookie côté serveur → Task 7
- [x] Backend : cookie-only (pas de token dans le body) → Task 1
- [x] Tests mis à jour → Task 9
- [x] Build vérifié → Task 10
