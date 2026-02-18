# MTG Tracker - Specifications techniques

## 1. Stack technique

| Couche             | Technologie                        | Rôle                                      |
| ------------------ | ---------------------------------- | ----------------------------------------- |
| Frontend           | Vue 3 (Composition API)            | Interface utilisateur SPA                 |
| Build              | Vite                               | Bundler et serveur de développement       |
| Langage            | TypeScript                         | Typage statique                           |
| CSS                | UnoCSS (preset-wind)               | Utilitaires CSS atomic, compatible Tailwind |
| State management   | Pinia                              | Stores réactifs                           |
| Routing            | unplugin-vue-router                | File-based routing automatique            |
| Backend / BDD      | Supabase (PostgreSQL)              | Base de données, API auto-générée         |
| Authentification   | Supabase Auth                      | Email/password, magic link                |
| Tests unitaires    | Vitest                             | Tests rapides, natif Vite                 |
| Tests E2E          | Playwright                         | Tests navigateur                          |
| Déploiement        | GitHub Pages                       | Hébergement statique SPA                  |
| PWA                | vite-plugin-pwa                    | Manifest + service worker minimal         |

## 2. Structure du projet

```
mtgapp/
├── frontend/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/                # Fichiers statiques (images, fonts)
│   │   ├── components/            # Composants Vue réutilisables
│   │   │   ├── ui/                # Composants UI génériques (boutons, modales, toasts)
│   │   │   ├── auth/              # Composants liés à l'authentification
│   │   │   ├── groups/            # Composants liés aux groupes
│   │   │   ├── games/             # Composants liés aux parties
│   │   │   └── stats/             # Composants liés aux statistiques
│   │   ├── composables/           # Composables Vue (logique réutilisable)
│   │   ├── layouts/               # Layouts de pages (default, auth)
│   │   ├── pages/                 # Pages (file-based routing)
│   │   │   ├── index.vue                          # / - Accueil
│   │   │   ├── login.vue                          # /login
│   │   │   ├── register.vue                       # /register
│   │   │   ├── auth/
│   │   │   │   └── verify.vue                     # /auth/verify
│   │   │   ├── reset-password.vue                 # /reset-password
│   │   │   ├── invite/
│   │   │   │   └── [code].vue                     # /invite/:code
│   │   │   ├── dashboard.vue                      # /dashboard
│   │   │   ├── profile.vue                        # /profile
│   │   │   └── groups/
│   │   │       └── [id]/
│   │   │           ├── index.vue                  # /groups/:id
│   │   │           ├── members.vue                # /groups/:id/members
│   │   │           ├── stats.vue                  # /groups/:id/stats
│   │   │           └── games/
│   │   │               ├── new.vue                # /groups/:id/games/new
│   │   │               └── [gameId].vue           # /groups/:id/games/:gameId
│   │   ├── stores/                # Stores Pinia
│   │   │   ├── auth.ts            # État d'authentification
│   │   │   ├── groups.ts          # Groupes de l'utilisateur
│   │   │   └── games.ts           # Parties du groupe courant
│   │   ├── lib/
│   │   │   └── supabase.ts        # Client Supabase (initialisation)
│   │   ├── types/                 # Types TypeScript partagés
│   │   │   └── database.ts        # Types générés depuis le schéma Supabase
│   │   ├── App.vue                # Composant racine
│   │   └── main.ts                # Point d'entrée
│   ├── e2e/                       # Tests Playwright
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── uno.config.ts              # Configuration UnoCSS
│   ├── playwright.config.ts
│   └── package.json
├── supabase/
│   ├── config.toml                # Configuration Supabase locale
│   ├── migrations/                # Migrations SQL versionnées
│   └── seed.sql                   # Données de test
└── specs/                         # Spécifications (ce répertoire)
```

## 3. Frontend

### 3.1 Conventions Vue

- **Composition API** exclusivement (pas d'Options API)
- **`<script setup lang="ts">`** pour tous les composants
- Nommage des composants : **PascalCase** pour les fichiers, **kebab-case** dans les templates
- Un composant par fichier
- Les props sont définies avec `defineProps<T>()` (typage TypeScript)
- Les événements sont définis avec `defineEmits<T>()`

### 3.2 File-based routing

Le plugin `unplugin-vue-router` génère les routes automatiquement depuis l'arborescence `src/pages/` :

| Fichier                              | Route générée              |
| ------------------------------------ | -------------------------- |
| `pages/index.vue`                    | `/`                        |
| `pages/login.vue`                    | `/login`                   |
| `pages/groups/[id]/index.vue`        | `/groups/:id`              |
| `pages/groups/[id]/games/[gameId].vue` | `/groups/:id/games/:gameId` |
| `pages/invite/[code].vue`           | `/invite/:code`            |

### 3.3 Layouts

Deux layouts principaux :

- **`default`** : header avec navigation (logo cliquable vers `/`), menu utilisateur (pages authentifiées)
- **`auth`** : layout minimal centré, sans navigation (login, register, reset password)

### 3.4 Guards de navigation

- Les pages authentifiées redirigent vers `/login` si l'utilisateur n'est pas connecté
- Les pages publiques (accueil, login, register) redirigent vers `/dashboard` si l'utilisateur est déjà connecté
- La page `/invite/:code` redirige vers `/login` avec le code en query param si non connecté, puis rejoint le groupe après connexion
- La page d'accueil (`/`) affiche un bouton "Accéder au tableau de bord" au lieu des boutons connexion/inscription si l'utilisateur est connecté
- Le dashboard (`/dashboard`) redirige automatiquement vers `/groups/:id` si l'utilisateur n'appartient qu'à un seul groupe

### 3.5 Stores Pinia

| Store    | Responsabilité                                          |
| -------- | ------------------------------------------------------- |
| `auth`   | Session utilisateur, profil, login/logout (logout redirige vers `/`) |
| `groups` | Liste des groupes de l'utilisateur, groupe courant      |
| `games`  | Parties du groupe courant, CRUD                         |

### 3.6 Client Supabase

Le client est initialisé une seule fois dans `src/lib/supabase.ts` et importé partout :

```ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

Les types `Database` sont générés automatiquement depuis le schéma Supabase avec `supabase gen types typescript`.

## 4. Supabase

### 4.1 Développement local

Le CLI Supabase permet de développer en local avec une instance complète (PostgreSQL, Auth, API) via Docker :

```bash
supabase init          # Initialise le dossier supabase/
supabase start         # Démarre les services locaux
supabase db reset      # Recrée la BDD depuis les migrations + seed
supabase gen types typescript --local > frontend/src/types/database.ts
```

### 4.2 Migrations

Les migrations SQL sont versionnées dans `supabase/migrations/`. Chaque migration est un fichier SQL nommé avec un timestamp :

```
supabase/migrations/
  20260213000001_create_profiles.sql
  20260213000002_create_groups.sql
  20260213000003_create_games.sql
  ...
```

### 4.3 Variables d'environnement

Le frontend utilise deux variables d'environnement :

```
VITE_SUPABASE_URL=http://localhost:54321    # URL de l'instance Supabase
VITE_SUPABASE_ANON_KEY=eyJ...               # Clé publique (anon key)
```

En production, ces variables pointent vers le projet Supabase distant.

### 4.4 Row Level Security (RLS)

Toutes les tables ont RLS activé. Les policies garantissent que :

- Un utilisateur ne voit que les données des groupes dont il est membre
- Les opérations d'écriture respectent les rôles (admin, membre)
- Les données d'authentification sont protégées par Supabase Auth nativement

Les policies sont définies dans les fichiers de migration SQL (voir `data-model.md`).

## 5. PWA

Configuration minimale via `vite-plugin-pwa` :

- **Manifest** : nom de l'app, icônes, couleur du thème, mode standalone
- **Service worker** : stratégie `registerType: 'autoUpdate'`, pas de cache offline au MVP
- L'application est installable sur mobile et desktop

## 6. Tests

### 6.1 Tests unitaires (Vitest)

- Fichiers de test colocalisés avec les sources : `MonComposant.test.ts`
- Couverture des stores Pinia et des composables
- Couverture des composants avec `@vue/test-utils`

### 6.2 Tests E2E (Playwright)

- Fichiers dans `frontend/e2e/`
- Tests des parcours utilisateur principaux (inscription, connexion, créer un groupe, saisir une partie)
- Exécutés contre l'instance Supabase locale

## 7. Déploiement

### 7.1 GitHub Pages

- Le frontend est buildé en SPA statique (`vite build`)
- Le dossier de sortie (`dist/`) est déployé sur GitHub Pages
- **Fallback SPA** : un fichier `404.html` identique à `index.html` est généré pour que le routing Vue fonctionne (GitHub Pages sert `404.html` pour toutes les routes inconnues)
- Base path configuré dans `vite.config.ts` si le repo n'est pas à la racine (`base: '/mtgapp/'`)

### 7.2 CI/CD

- GitHub Actions pour le déploiement automatique sur push sur `main`
- Étapes : install → test (Vitest) → build → deploy GitHub Pages

## 8. Conventions générales

### Nommage

| Élément          | Convention         | Exemple                   |
| ---------------- | ------------------ | ------------------------- |
| Fichiers Vue     | kebab-case ou PascalCase selon contexte | `GameCard.vue`, `new.vue` |
| Composants       | PascalCase         | `GameCard`, `GroupList`   |
| Composables      | camelCase, préfixe `use` | `useAuth`, `useGames` |
| Stores           | camelCase, préfixe `use` | `useAuthStore`        |
| Types            | PascalCase         | `Game`, `GroupMember`     |
| Fichiers TS      | kebab-case         | `supabase.ts`             |
| Tables SQL       | snake_case pluriel | `profiles`, `games`       |
| Colonnes SQL     | snake_case         | `created_at`, `group_id`  |

### Gestion des erreurs

- Les erreurs Supabase sont interceptées dans les stores/composables
- L'utilisateur reçoit un feedback via un système de toasts (composant global)
- Les erreurs de validation formulaire sont affichées sous les champs concernés
