# Stratégie Zod : Schémas générés vs manuels

> Contexte : Next.js + hey-api/openapi-ts + API Platform (Symfony), ressources API découplées des entités Doctrine.

---

## Le débat

### Option A — Schémas Zod auto-générés (`zod.gen.ts`)

hey-api/openapi-ts génère un fichier `zod.gen.ts` complet (1 042 lignes dans ce projet) à partir du spec OpenAPI. Le plugin SDK peut activer la validation automatique des réponses via `validator: { response: "zod" }`, ce qui est déjà configuré dans `openapi-ts.config.ts`.

**Avantages :**

- Zéro maintenance manuelle : toute évolution de l'API se propage automatiquement lors du `codegen`.
- Le spec OpenAPI est la source de vérité unique ; les schémas Zod reflètent exactement ce que l'API déclare exposer.
- Détection précoce des dérives : si l'API change, la régénération casse la compilation TypeScript partout où les types sont utilisés.
- Les types SDK (`types.gen.ts`) et les schémas Zod (`zod.gen.ts`) sont toujours cohérents entre eux.

**Risques :**

- Le spec OpenAPI doit être fidèle à la réalité du backend. Un spec inexact produit des schémas inexacts.
- Les schémas générés couvrent la structure brute de l'API (avec les préfixes `hydra:`, `@context`, etc.) et peuvent nécessiter une adaptation côté UI.
- Le dossier `src/api/generated/` est en lecture seule — aucune personnalisation directe.

---

### Option B — Schémas Zod manuels dans `src/state/`

Approche actuelle du projet : les fichiers `race/queries.ts`, `runners/queries.ts`, etc. définissent leurs propres schémas Zod (ex. `runSchema`, `runnerSchema`) et exportent des types via `z.infer<>`.

**Avantages :**

- Les schémas manuels ne capturent que les champs réellement utilisés par l'UI, avec des règles métier spécifiques (ex. filtrage `status === "FINISHED"`, `nullish()` permissif).
- Les types `z.infer<>` servent de contrat interne stable entre la couche state et les composants React.
- Indépendance partielle vis-à-vis du contrat API : des champs ajoutés côté API ne cassent pas les schémas existants.

**Risques :**

- **Dérive silencieuse** : si l'API renomme un champ, le schéma manuel continue de parser sans erreur (car les champs sont tous `.optional()`) et les données manquantes passent inaperçues jusqu'au runtime UI.
- Duplication : les noms et types des champs sont définis deux fois (dans `types.gen.ts` et dans `src/state/`).
- Maintenance manuelle à chaque évolution du spec.

---

## Contexte spécifique : API Platform avec ressources découplées

API Platform génère automatiquement un spec OpenAPI depuis les classes `#[ApiResource]` découplées des entités Doctrine. Ce découplage est une force :

- Le spec reflète le contrat public explicitement modélisé, pas la structure interne de la base de données.
- Les ressources API sont stables par conception (elles ne changent pas avec les migrations Doctrine).
- La génération OpenAPI d'API Platform est fiable et exhaustive (annotations, serialization groups, validations).

**Conclusion sur la fiabilité du spec** : dans ce projet, le spec est plus fiable que dans une architecture couplée aux entités. Faire confiance aux schémas générés depuis ce spec est raisonnable.

---

## Recommandation

**Adopter l'Option C (hybride) avec migration progressive vers les types générés.**

**Principe directeur :** les schémas Zod générés dans `zod.gen.ts` sont suffisamment fiables pour la validation de réponse HTTP (déjà activée via `validator: { response: "zod" }`). Les schémas manuels dans `src/state/` doivent être **allégés** : leur rôle n'est plus de revalider la structure brute de l'API, mais d'exprimer la **projection métier** (champs pertinents pour l'UI, transformations, filtres).

**Actions concrètes :**

1. **Laisser `responseValidator` actif** dans `openapi-ts.config.ts` — il valide déjà les réponses via `zod.gen.ts` avant que les données arrivent dans les query functions.
2. **Remplacer les types manuels** (`Run`, `Participation`, `Runner`) par les types générés depuis `types.gen.ts` pour éliminer la duplication.
3. **Conserver les schémas manuels uniquement** là où une logique de transformation est nécessaire (projection de champs, parsing d'une union, filtrage avant retour à React Query).
4. **Pour les APIs externes non générées** (ex. Open-Meteo dans `weather/queries.ts`), continuer avec des schémas Zod entièrement manuels — c'est le seul cas où l'Option B est la seule option viable.

**Règle simple** : si le champ existe dans `types.gen.ts`, utiliser ce type. Si une transformation métier est nécessaire, envelopper avec un schéma Zod minimal qui s'appuie sur les types générés plutôt que de les redéfinir.

---

_Références : [hey-api Validators](https://heyapi.dev/openapi-ts/validators) · [hey-api Zod Plugin](https://heyapi.dev/openapi-ts/plugins/zod) · [Schema drift prevention](https://evilmartians.com/chronicles/lifes-too-short-to-hand-write-api-types-openapi-driven-react) · [API Platform DTOs](https://api-platform.com/docs/core/dto/)_
