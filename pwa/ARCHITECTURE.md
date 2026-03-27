# Architecture technique — PWA 24H Race

Documentation destinée aux développeurs et aux agents IA intervenant sur ce projet.
Dernière mise à jour : 2026-03-26.

---

## Stack technique

| Couche | Outil | Version | Notes |
|--------|-------|---------|-------|
| Framework | Next.js App Router | ^16 | `output: "standalone"`, Turbopack en dev |
| UI | Chakra UI v3 | ^3.34 | **Pas** Chakra UI v2 — API différente |
| Styles legacy | Tailwind CSS v4 + DaisyUI v5 | — | Uniquement dans `app/legacy/` |
| State / fetch | TanStack Query v5 | ^5.95 | `retry: 3` global sur les queries |
| Formulaires | TanStack Form v1 | ^1.28 | Validators inline avec Zod `safeParse` |
| Validation | Zod v4 | ^4.3 | Formulaires + (à venir) parsing réponses API |
| Animations | Framer Motion | ^12 | `motion.create(Box)` pour les composants Chakra |
| HTTP client | Axios via `src/api/client.ts` | ^1.9 | Intercepteur JWT auto depuis localStorage |
| SDK API | hey-api/openapi-ts | ^0.94 | Génération depuis `/api/docs.json` |
| Tests unitaires | Vitest + React Testing Library | — | MSW v2 pour mocker les appels |
| Tests E2E | Playwright | ^1.58 | `e2e/navigation.spec.ts` |
| Notifications | Chakra UI Toaster | — | `components/ui/toaster.tsx`, `toaster.create()` |

---

## Variables d'environnement

| Variable | Utilisation | Valeur par défaut |
|----------|-------------|-------------------|
| `NEXT_PUBLIC_ENTRYPOINT` | Base URL de l'API Symfony | `http://localhost` |
| `NEXT_PUBLIC_MERCURE_HUB_URL` | URL du hub Mercure | — |
| `DISPLAY_EMAIL` / `DISPLAY_PASSWORD` | Credentials pour la page display (SSR legacy) | — |
| `API_ENTRYPOINT` | Alternative server-side à `NEXT_PUBLIC_ENTRYPOINT` | — |

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
│   ├── upload/page.tsx           # Upload photo par les participants
│   ├── legacy/                   # Pages Tailwind+DaisyUI (Admin, Display, Résultats)
│   │   ├── admin/                # React-Admin (API Platform)
│   │   ├── display/index.tsx     # Affichage temps réel (getServerSideProps + SSE Mercure)
│   │   └── resultats/index.tsx   # Classement public
│   ├── layout.tsx                # Root layout (Providers)
│   └── providers.tsx             # QueryClient + ChakraProvider + Toaster
│
├── components/ui/
│   ├── theme.ts                  # Palette teal #0f929a, tokens Chakra UI v3
│   ├── provider.tsx              # ChakraProvider wrapper
│   ├── toaster.tsx               # Toaster global (createToaster)
│   └── color-mode.tsx            # ColorModeProvider
│
├── src/
│   ├── api/
│   │   ├── client.ts             # axios instance (baseURL = NEXT_PUBLIC_ENTRYPOINT, intercepteur JWT)
│   │   ├── sdk-client.ts         # Configuration du client hey-api généré
│   │   └── generated/            # SDK généré par hey-api (gitignored — voir §SDK)
│   │
│   └── state/                    # Queries et mutations par domaine
│       ├── auth/mutations.ts     # useLoginMutation, useResetPasswordMutation
│       ├── race/queries.ts       # useRunsQuery, useParticipationsQuery + types Run/Participation
│       ├── runners/queries.ts    # useRunnersQuery, useRunnersInfiniteQuery + type Runner
│       ├── media/mutations.ts    # useUploadRaceMediaMutation
│       └── weather/queries.ts    # useWeatherQuery (Open-Meteo, pas notre API)
│
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
- **Pas de `Box as="a"` avec `css` prop** — utiliser des `<a>` natifs avec classes CSS pour les animations complexes (voir `app/page.tsx`)

### Polices

Aucune font custom — stack système Chakra par défaut. Ne pas importer de fonts Google/Fontsource pour les pages Chakra.

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
}
```

### Queries régulières vs InfiniteQuery

- `useRunnersQuery()` — liste complète (max 100), pour les selects/dropdowns
- `useRunnersInfiniteQuery()` — pagination 30 par page, pour les longues listes UI

### Erreurs globales

Les **mutations** remontent les erreurs via `defaultOptions.mutations.onError` dans `providers.tsx` → `toaster.create({ type: "error" })`.

Les **queries** n'ont pas de handler global car le retry (x3) gère les erreurs transitoires.

---

## Authentification

- Login via `POST /auth` → reçoit `{ token: string }`
- Token stocké dans `localStorage` sous la clé `"token"`
- `src/api/client.ts` injecte `Authorization: Bearer <token>` automatiquement sur chaque requête
- Après login réussi → redirect vers `/`
- Pas de refresh token pour l'instant

---

## SDK OpenAPI (hey-api)

### Générer le SDK

L'API doit être démarrée (`docker compose up`) avant de générer :

```bash
cd pwa
npm run generate-api
# → génère src/api/generated/ depuis http://localhost/api/docs.json
```

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
// Configurer le client (fait dans src/api/sdk-client.ts)
import { client } from "./generated/client.gen"
client.setConfig({ baseURL: process.env.NEXT_PUBLIC_ENTRYPOINT })

// Appeler une fonction du SDK
import { getUsersPublicCollection } from "@/api/generated/sdk.gen"
const { data } = await getUsersPublicCollection({ query: { itemsPerPage: 30 } })
```

> **Règle** : ne jamais deviner les routes (`/users/public`, `/runs`, etc.) — toujours utiliser les fonctions du SDK généré.

---

## Pages legacy (`app/legacy/`)

Ces pages utilisent **Tailwind CSS + DaisyUI**, pas Chakra UI. Ne pas mélanger.

| Page | Route | Notes |
|------|-------|-------|
| Admin | `/legacy/admin` | React-Admin + API Platform |
| Display | `/legacy/display` | `getServerSideProps` + SSE Mercure, credentials env |
| Résultats | `/legacy/resultats` | Client-side, axios direct |

La page `display` utilise `getServerSideProps` qui n'est **pas** supporté en App Router natif — elle vit dans `app/legacy/display/index.tsx` avec un wrapper Page Router simulé.

---

## Tests

### Unitaires (Vitest + RTL)

```bash
npm run test
```

MSW est configuré dans `src/mocks/handlers.ts` — les handlers mockent :
- `GET /users/public` → liste de coureurs
- `POST /race_medias` → upload OK
- `POST /auth` → token si credentials corrects
- `GET api.open-meteo.com/...` → météo simulée

### E2E (Playwright)

```bash
npx playwright test
```

Tests dans `e2e/navigation.spec.ts`. Requiert que `next dev` tourne sur le port 3000.

---

## Décisions techniques notables

### Pourquoi `Box as="a"` a été abandonné pour les liens avec animation

Chakra UI v3 a des types très stricts sur les composants polymorphiques (`as` prop). Combiner `as="a"` + `css` prop + `_hover` avec des sélecteurs CSS enfants (`& .arrow-box`) cause des erreurs TypeScript impossibles à résoudre proprement. **Solution** : utiliser des `<a>` natifs avec des classes CSS dans un `<style>` inliné (voir `app/page.tsx`).

### Pourquoi TanStack Form et pas React Hook Form

Déjà installé dans le projet à la migration. TanStack Form v1 s'intègre bien avec Zod via `safeParse` inline dans les validators.

### Pourquoi axios et pas fetch natif

`src/api/client.ts` centralise l'injection du token JWT et la base URL. L'intercepteur évite de répéter `Authorization: Bearer ...` dans chaque appel. Le SDK hey-api est également configuré avec `@hey-api/client-axios`.

### Pourquoi le SDK généré est commis dans le repo

Pour que les builds CI/CD et les autres développeurs n'aient pas besoin de l'API en live pour compiler. Régénérer manuellement après chaque changement du schéma API.
