# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a **24H race management application** built on the API Platform framework. It manages runners (`User`), race events (`Run`), participation tracking (`Participation`), and media uploads. The name "24H" refers to a 24-hour race/endurance event format.

The stack:
- **Backend**: Symfony 7.4 + API Platform 4 + FrankenPHP (PHP 8.4)
- **Frontend**: Next.js 16 (React 19) + Chakra UI + TanStack Query + Tailwind CSS
- **Database**: PostgreSQL 16
- **Object storage**: RustFS (S3-compatible) via Flysystem
- **Real-time**: Mercure (built into Caddy/FrankenPHP)
- **Auth**: JWT (LexikJWTAuthenticationBundle)

## Development Commands

All services run via Docker Compose from the repo root:

```bash
docker compose up --build    # Start all services (dev overrides applied automatically)
docker compose down          # Stop all services
```

### API (Symfony — inside container)

```bash
# Run all PHP tests
docker compose exec php bin/phpunit

# Run a single test file
docker compose exec php bin/phpunit tests/Functional/Api/Run/RunTest.php

# Static analysis
docker compose exec php vendor/bin/phpstan analyse

# Code style fix
docker compose exec php vendor/bin/php-cs-fixer fix

# Doctrine migrations
docker compose exec php bin/console make:migration
docker compose exec php bin/console doctrine:migrations:migrate -n

# Load fixtures
docker compose exec php bin/console doctrine:fixtures:load
```

### PWA (Next.js — from `pwa/` directory)

The PWA uses **npm** as its package manager.

```bash
# Install dependencies
cd pwa && npm install --legacy-peer-deps

# Dev server (runs inside Docker normally, but can run locally)
npm run dev
# Or with MSW mocks (no backend needed):
npm run dev:mock

# Unit tests (Vitest)
npm test
npm run test:watch

# Lint and format
npm run lint
npm run lint:fix
npm run format
npm run type:check

# Regenerate API client from OpenAPI spec (requires running API)
npm run generate-api
```

### E2E Tests (Playwright — from `e2e/` directory)

```bash
cd e2e && npx playwright test
```

E2E tests run against `https://localhost` (the full stack must be running).

## Architecture

### API Layer Pattern

The API uses a **DTO-based architecture** separating persistence models from API contracts:

```
src/Entity/        ← Doctrine ORM entities (pure persistence)
src/ApiResource/   ← API Platform resource definitions (DTOs with #[ApiResource])
src/Dto/           ← Input/Output DTOs (CreateX, UpdateX, XCollection, XRef)
src/State/         ← Custom processors and providers
src/ObjectMapper/  ← Transformers using Symfony ObjectMapper (#[Map] attributes)
src/Security/      ← Voters
```

Key pattern: **API resources are separate PHP classes** from Doctrine entities. `RunApi`, `ParticipationApi`, `UserApi` are the API-facing DTOs, linked to entities via `stateOptions: new Options(entityClass: ...)` and `#[Map(source: EntityClass::class)]`. This means changes to entity internals do not automatically surface in the API.

### Core Domain Model

- `Run` — a race event with `startDate` / `endDate`
- `User` — a runner (firstName, lastName, optional email/password/organization, optional profile image)
- `Participation` — join table between `User` and `Run`; gains an `arrivalTime` when the runner finishes
- `Medias` — user profile photo (VichUploader, stored on S3/RustFS, mapped `users`)
- `RaceMedia` — race event photos (VichUploader, mapped `race_media`)

**Business rule**: When a new `User` is created, `UserProcessor` automatically creates a `Participation` for every existing `Run`.

**Arrival scanning**: `POST /participations/finished` accepts a `DataMatrixInput` (raw barcode payload containing `originId`), finds the user's active participation, and sets `arrivalTime = now`.

### Frontend Structure (`pwa/`)

```
app/              ← Next.js App Router pages
  admin/          ← React-Admin interface (API Platform Admin)
  legacy/         ← Legacy admin/display pages
  scanner/        ← QR/barcode scanner for recording arrivals
  classement/     ← Race standings/leaderboard
  gallery/        ← Race media gallery
  upload/         ← Photo upload
  public-race-status/ ← Public live race status
components/       ← Shared UI components
src/
  api/            ← Generated API client (hey-api/openapi-ts) + custom SDK
  hooks/          ← React Query hooks
  state/          ← Client state
  ui/             ← UI primitives
```

The API client under `src/api/generated/` is **auto-generated** from the OpenAPI spec via `npm run generate-api`. Do not edit generated files manually.

### File Storage

VichUploader handles file uploads; Flysystem routes them to RustFS (S3-compatible). Two mappings exist:
- `users` → user profile photos
- `race_media` → race event photos

S3 public URL is exposed at `/s3` via the PHP/Caddy container reverse proxy.

### Authentication

JWT-based. Admin routes require `ROLE_ADMIN`. The `ParticipationApi` has a custom voter `PARTICIPATION_VIEW` for scanner access without full admin rights.

## Testing

- **PHP tests**: PHPUnit + Zenstruck Foundry (factories) + DAMA DoctrineTestBundle (DB isolation in transactions)
- **PWA unit tests**: Vitest + Testing Library + MSW for API mocking (workers in `pwa/public/`)
- **E2E**: Playwright against the full Docker stack at `https://localhost`

Test factories live in `api/src/Factory/`. Functional API tests extend `AbstractTestCase` in `tests/Functional/Api/`.

## Code Quality

- PHPStan level 6 with Symfony + Doctrine extensions and dead-code detection (`shipmonk/dead-code-detector`)
- php-cs-fixer for PHP formatting
- ESLint (flat config) + Prettier for TypeScript/TSX
- Husky pre-commit hook runs lint-staged on the PWA
