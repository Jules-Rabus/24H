# Architecture technique — PWA 24H Race

Documentation destinée aux développeurs et aux agents IA intervenant sur ce projet.
Dernière mise à jour : 2026-03-31.

---

## Stack technique

| Couche          | Outil                          | Version | Notes                                           |
| --------------- | ------------------------------ | ------- | ----------------------------------------------- |
| Framework       | Next.js App Router             | ^16     | `output: "standalone"`, Turbopack en dev        |
| UI              | Chakra UI v3                   | ^3.34   | **Pas** Chakra UI v2 — API différente           |
| Styles legacy   | Tailwind CSS v4 + DaisyUI v5   | —       | Uniquement dans `app/legacy/`                   |
| State / fetch   | TanStack Query v5              | ^5.95   | `retry: 3` global sur les queries               |
| Formulaires     | TanStack Form v1               | ^1.28   | Validators inline avec Zod `safeParse`          |
| Validation      | Zod v4                         | ^4.3    | Formulaires + (à venir) parsing réponses API    |
| Animations      | Framer Motion                  | ^12     | `motion.create(Box)` pour les composants Chakra |
| HTTP client     | Axios via `src/api/client.ts`  | ^1.9    | `withCredentials: true` — cookie JWT httpOnly   |
| SDK API         | hey-api/openapi-ts             | ^0.94   | Génération depuis `/api/docs.json`              |
| Tests unitaires | Vitest + React Testing Library | —       | MSW v2 pour mocker les appels                   |
| Tests E2E       | Playwright                     | ^1.58   | `e2e/navigation.spec.ts`                        |
| Notifications   | Chakra UI Toaster              | —       | `components/ui/toaster.tsx`, `toaster.create()` |
| QR Code (PDF)   | @bwip-js/browser               | —       | `bcid: "qrcode"` — remplace DataMatrix          |
| QR Scanner      | @yudiel/react-qr-scanner       | —       | format `"qr_code"` — remplace `"data_matrix"`   |
| Pre-commit      | Husky v9                       | ^9.1.7  | lint + format:check + type:check + test         |

---

## Variables d'environnement

| Variable                             | Utilisation                                        | Valeur par défaut  |
| ------------------------------------ | -------------------------------------------------- | ------------------ |
| `NEXT_PUBLIC_ENTRYPOINT`             | Base URL de l'API Symfony                          | `http://localhost` |
| `NEXT_PUBLIC_MERCURE_HUB_URL`        | URL du hub Mercure                                 | —                  |
| `DISPLAY_EMAIL` / `DISPLAY_PASSWORD` | Credentials pour la page display (SSR legacy)      | —                  |
| `API_ENTRYPOINT`                     | Alternative server-side à `NEXT_PUBLIC_ENTRYPOINT` | —                  |

> **Important** : toujours utiliser `NEXT_PUBLIC_ENTRYPOINT`, jamais `NEXT_PUBLIC_API_URL` (n'existe pas dans ce projet).

---

## Structure des dossiers

```
pwa/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Hub (/, liens API docs / Admin / Mercure)
│   ├── login/page.tsx            # Connexion (TanStack Form + Zod)
│   ├── forgot-password/page.tsx  # Réinitialisation mot de passe
│   ├── public-race-status/       # Statut course en direct (public)
│   ├── scanner/                  # Scanner QR code + saisie manuelle dossard
│   ├── upload/page.tsx           # Upload photo par les participants
│   ├── gallery/page.tsx          # Galerie des médias
│   ├── admin/                    # Admin moderne Chakra UI (remplace legacy/admin)
│   │   ├── layout.tsx            # Layout admin (sidebar, auth check)
│   │   ├── users/                # CRUD utilisateurs + PDF dossard
│   │   ├── participations/       # CRUD participations
│   │   ├── runs/                 # CRUD runs
│   │   └── medias/               # CRUD médias
│   ├── legacy/                   # Pages Tailwind+DaisyUI (Admin React-Admin, Display, Résultats)
│   │   ├── admin/                # React-Admin (API Platform)
│   │   ├── display/index.tsx     # Affichage temps réel (useEffect + SSE Mercure)
│   │   └── resultats/index.tsx   # Classement public
│   ├── layout.tsx                # Root layout (Providers)
│   └── providers.tsx             # QueryClient + ChakraProvider + Toaster
│
├── components/
│   ├── ui/
│   │   ├── theme.ts              # Palette teal #0f929a, tokens Chakra UI v3
│   │   ├── provider.tsx          # ChakraProvider wrapper
│   │   ├── toaster.tsx           # Toaster global (createToaster)
│   │   └── color-mode.tsx        # ColorModeProvider
│   ├── classement/
│   │   └── BibDownloadButton.tsx # Bouton PDF dossard QR code (bwip-js)
│   ├── entities/
│   │   └── users.tsx             # Composants entité User (liste, show, PDF)
│   └── utils/
│       └── providers.tsx         # Auth provider pour React-Admin (cookie JWT)
│
├── src/
│   ├── api/
│   │   ├── client.ts             # axios instance (withCredentials: true, cookie BEARER)
│   │   ├── sdk-client.ts         # Configuration du client hey-api généré
│   │   └── generated/            # SDK généré par hey-api (gitignored — voir §SDK)
│   │
│   └── state/                    # Queries et mutations par domaine
│       ├── auth/
│       │   ├── mutations.ts      # useLoginMutation, useResetPasswordMutation
│       │   ├── queries.ts        # useCurrentUserQuery (GET /me)
│       │   └── schemas.ts        # loginResponseSchema
│       ├── race/
│       │   ├── queries.ts        # useRunsQuery, useParticipationsQuery
│       │   └── schemas.ts        # runSchema, participationSchema + types Run/Participation
│       ├── runners/
│       │   ├── queries.ts        # useRunnersQuery, useRunnersInfiniteQuery
│       │   └── schemas.ts        # runnerSchema, runnersPageSchema + type Runner
│       ├── media/
│       │   ├── mutations.ts      # useUploadRaceMediaMutation
│       │   └── schemas.ts        # raceMediaSchema + type RaceMedia
│       ├── weather/
│       │   ├── queries.ts        # useWeatherQuery (Open-Meteo, pas notre API)
│       │   └── schemas.ts        # weatherResponseSchema + type WeatherResponse
│       └── admin/                # Queries/mutations pour l'admin moderne
│           ├── users/
│           ├── participations/
│           ├── runs/
│           └── medias/           # adminMediaKeys — utilisé pour setQueryData Mercure
│
├── .husky/pre-commit             # lint + format:check + type:check + test
├── openapi-ts.config.ts          # Config hey-api (input: /api/docs.json, output: src/api/generated)
└── ARCHITECTURE.md               # Ce fichier
```

---

## Thème et design system

### Palette de couleurs

Le projet utilise une palette **teal monochrome** héritée de l'identité visuelle API Platform :

```
primary.500 = #0f929a  ← couleur principale (boutons, accents)
primary.600 = #0c7a81  ← hover
primary.100 = #b3e4e7  ← muted/fond léger
```

### Règles Chakra UI v3

- `colorPalette="primary"` sur les `Button` et badges
- `Card.Root` / `Card.Body` (pas `<Card>` v2)
- `Field.Root` / `Field.Label` / `Field.ErrorText` (pas `FormControl`)
- `Alert.Root` avec `status="error"` ou `status="success"`
- `Button` avec prop `loading` + `loadingText` (pas `isLoading`)
- `Skeleton` avec prop `loading` (pas `isLoaded`) — utilisé dans `public-race-status`
- **Pas de `Box as="a"` avec `css` prop** — utiliser des `<a>` natifs avec classes CSS pour les animations complexes (voir `app/page.tsx`)

### Polices

Aucune font custom — stack système Chakra par défaut. Ne pas importer de fonts Google/Fontsource pour les pages Chakra.

---

## Authentification

- Login via `POST /auth` → le cookie `BEARER` (httpOnly, Secure, SameSite=Strict) est posé par l'API
- **Plus de token dans localStorage** — `withCredentials: true` dans axios envoie le cookie automatiquement
- `GET /me` → retourne le `UserMe` DTO de l'utilisateur connecté (ou 401)
- Après login réussi → redirect vers `/`
- Logout via `POST /logout` → invalide le cookie côté serveur

> **Règle** : ne jamais lire ni écrire `localStorage` pour le token. Le cookie est géré exclusivement par l'API.

---

## Gestion du state (TanStack Query)

### Convention des query keys

Chaque domaine expose un objet `*Keys` pour éviter les collisions :

```ts
// src/state/runners/queries.ts
export const runnerKeys = {
  all: ["runners"] as const,
  list: (params?) => [...runnerKeys.all, "list", params] as const,
  infinite: (params?) => [...runnerKeys.all, "infinite", params] as const,
};
```

### Queries régulières vs InfiniteQuery

- `useRunnersQuery()` — liste complète (max 100), pour les selects/dropdowns
- `useRunnersInfiniteQuery()` — pagination 30 par page, pour les longues listes UI

### Erreurs globales

Les **mutations** remontent les erreurs via `defaultOptions.mutations.onError` dans `providers.tsx` → `toaster.create({ type: "error" })`.

Les **queries** n'ont pas de handler global car le retry (x3) gère les erreurs transitoires.

---

## Mercure (temps réel)

### Principe

L'API publie automatiquement des événements Mercure sur les opérations d'écriture grâce à `mercure: true` dans `#[ApiResource]`. Les pages s'y abonnent via `EventSource`.

### Ressources avec Mercure activé

- `Participation` — nouvelles arrivées, changements de statut
- `RaceMedia` — nouvelles photos uploadées

### Pattern d'abonnement (public-race-status)

```ts
// Un seul EventSource, deux topics
const url = new URL(mercureHubUrl);
url.searchParams.append("topic", `${entrypoint}/participations/{id}`);
url.searchParams.append("topic", `${entrypoint}/race_medias/{id}`);

const es = new EventSource(url);
es.onmessage = (e) => {
  const data = JSON.parse(e.data);
  if (data.contentUrl !== undefined) {
    // Nouveau média → prepend dans le cache TanStack Query
    queryClient.setQueryData(adminMediaKeys.list(), (old) => [
      data,
      ...(old ?? []),
    ]);
  } else {
    // Nouvelle participation/arrivée → invalider la query
    queryClient.invalidateQueries({ queryKey: participationKeys.all });
  }
};
```

> **Règle** : distinguer les types d'événements par la présence d'une propriété discriminante (`contentUrl` pour les médias, `status` pour les participations). Ne pas se fier à l'URL du topic (wildcards).

---

## SDK OpenAPI (hey-api)

### Générer le SDK

L'API doit être démarrée (`docker compose up`) avant de générer :

```bash
# 1. Exporter le schéma depuis le container Symfony
docker compose exec php bin/console api:openapi:export > /tmp/openapi.json
docker compose cp php:/tmp/openapi.json pwa/openapi.json

# 2. Générer le SDK
cd pwa
pnpm run generate-api
# → génère src/api/generated/ depuis openapi.json local
```

> **Règle** : ne jamais éditer `src/api/generated/` à la main — toujours régénérer depuis l'OpenAPI Symfony.

### Structure générée

```
src/api/generated/
├── client.gen.ts     # client axios configuré
├── sdk.gen.ts        # fonctions typées (ex: getUsersPublicCollection, postAuth...)
├── types.gen.ts      # types TypeScript des entités
└── zod.gen.ts        # schémas Zod générés (si plugin zod activé)
```

### Utilisation

```ts
import { getUsersPublicCollection } from "@/api/generated/sdk.gen";
const { data } = await getUsersPublicCollection({
  query: { itemsPerPage: 30 },
});
```

> **Règle** : ne jamais deviner les routes (`/users/public`, `/runs`, etc.) — toujours utiliser les fonctions du SDK généré.

---

## QR Code dossard

Le PDF de dossard est généré côté client avec `@bwip-js/browser` (canvas → PNG → PDF via `@react-pdf/renderer`).

```ts
import { qrcode } from "@bwip-js/browser";
qrcode(canvas, {
  bcid: "qrcode",
  text: JSON.stringify({ originId: user.id }),
  scale: 7,
});
```

Le scanner (`app/scanner/`) lit les QR codes avec `@yudiel/react-qr-scanner`, format `"qr_code"`. Il supporte également la **saisie manuelle** du numéro de dossard via un champ en bas d'écran (mobile-friendly).

> **Migration** : les anciens codes DataMatrix générés avec `bcid: "datamatrix"` ne sont plus supportés — remplacés par QR Code natif iOS/Android.

---

## Pages legacy (`app/legacy/`)

Ces pages utilisent **Tailwind CSS + DaisyUI**, pas Chakra UI. Ne pas mélanger.

| Page      | Route               | Notes                                          |
| --------- | ------------------- | ---------------------------------------------- |
| Admin     | `/legacy/admin`     | React-Admin + API Platform                     |
| Display   | `/legacy/display`   | Client-side (`useEffect` + axios), SSE Mercure |
| Résultats | `/legacy/resultats` | Client-side, axios direct                      |
| Scanner   | `/legacy/scanner`   | QR code scanner (legacy)                       |

Chaque page legacy a un `page.tsx` (App Router) avec `"use client"` et `next/dynamic` (ssr: false) qui charge l'`index.tsx` côté client uniquement.

> **Important** : les packages `@api-platform/admin` et `react-admin` ne déclarent pas `"use client"`. Ils sont listés dans `transpilePackages` dans `next.config.ts`.

---

## Tests

### Unitaires (Vitest + RTL)

```bash
pnpm run test
```

MSW est configuré dans `src/mocks/handlers.ts` — les handlers mockent :

- `GET /users/public` → liste de coureurs
- `POST /race_medias` → upload OK
- `POST /auth` → token si credentials corrects
- `GET /me` → utilisateur connecté
- `GET api.open-meteo.com/...` → météo simulée

### E2E (Playwright)

```bash
npx playwright test
```

Tests dans `e2e/navigation.spec.ts`. Requiert que `next dev` tourne sur le port 3000.

---

## Pipeline CI (GitHub Actions)

Le job `pwa-quality` dans `.github/workflows/ci.yml` exécute dans l'ordre :

1. `pnpm run lint` — ESLint
2. `pnpm run format:check` — vérification formatage Prettier
3. `pnpm run type:check` — vérification TypeScript (`tsc --noEmit`)
4. `pnpm run test` — Vitest (tests unitaires)
5. `pnpm run build` — `next build` (production)

**Scripts disponibles dans `package.json`** :

| Script         | Commande                                    |
| -------------- | ------------------------------------------- |
| `type:check`   | `tsc --noEmit`                              |
| `lint`         | `eslint .`                                  |
| `lint:fix`     | `eslint . --fix`                            |
| `format`       | `prettier --write .`                        |
| `format:check` | `prettier --check .`                        |
| `test`         | `vitest run`                                |
| `test:watch`   | `vitest`                                    |
| `build`        | `next build`                                |
| `generate-api` | génère le SDK hey-api depuis `openapi.json` |

### Husky pre-commit

Le hook `.husky/pre-commit` exécute localement avant chaque commit :

```sh
cd pwa
pnpm run lint
pnpm run format:check
pnpm run type:check
pnpm run test
```

Activé via `pnpm install` (script `prepare` dans `package.json`).

---

## Stratégie Zod (approche hybride — Option C)

- Les schémas Zod sont dans `src/state/<domain>/schemas.ts` — **1 fichier de schémas par domaine**
- Les types exposés à l'UI viennent de `z.infer<typeof schema>` (pas de `types.gen.ts` directement)
- Le `responseValidator` hey-api valide les réponses HTTP via `zod.gen.ts` — les schémas manuels expriment la **projection métier**
- Exception : `weather/schemas.ts` valide manuellement l'API Open-Meteo (non générée)

> **Règle absolue** : les types TypeScript manuels (`type Foo = { ... }`) sont **interdits** dans `src/state/`. Tous les types doivent être dérivés d'un schéma Zod via `z.infer<typeof schema>`. Les re-exports (`export type Foo = Bar`) et alias (`export type AdminFoo = Foo`) sont autorisés uniquement si le type source est lui-même un `z.infer`.

---

## Décisions techniques notables

### Cookie JWT httpOnly à la place de localStorage

L'API pose un cookie `BEARER` httpOnly après login. Axios envoie ce cookie automatiquement via `withCredentials: true`. Cela évite les attaques XSS qui lisent le token depuis le JS. **Ne jamais revenir à localStorage pour le token.**

### `/me` et non `/users/me`

La route `/users/me` était capturée par `/users/{id}` (avec `id=me`) avant d'atteindre l'opération custom. Déplacée en `/me` (sans préfixe `/users`). L'API retourne le DTO `UserMe` (sans `participations`) pour éviter une circular reference Doctrine sur `Run`.

### Mercure : distinguer les types d'événements par propriété discriminante

Un seul `EventSource` souscrit à plusieurs topics wildcard. Pour différencier un événement `RaceMedia` d'un `Participation`, on teste `data.contentUrl !== undefined`. C'est plus robuste que de parser l'URL du topic (qui contient `{id}`). Voir `ARCHITECTURE.md §Mercure`.

### Pourquoi `Box as="a"` a été abandonné pour les liens avec animation

Chakra UI v3 a des types très stricts sur les composants polymorphiques. Combiner `as="a"` + `css` prop + `_hover` avec des sélecteurs CSS enfants cause des erreurs TypeScript. **Solution** : utiliser des `<a>` natifs avec classes CSS dans un `<style>` inliné (voir `app/page.tsx`).

### Pourquoi TanStack Form et pas React Hook Form

Déjà installé dans le projet à la migration. TanStack Form v1 s'intègre bien avec Zod via `safeParse` inline dans les validators.

### Pourquoi axios et pas fetch natif

`src/api/client.ts` centralise `withCredentials: true` et la base URL. Le SDK hey-api est également configuré avec `@hey-api/client-axios`.

### Pourquoi le SDK généré est commis dans le repo

Pour que les builds CI/CD et les autres développeurs n'aient pas besoin de l'API en live pour compiler. Régénérer manuellement après chaque changement du schéma API.
