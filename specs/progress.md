# MTG Tracker - Avancement

## Legende

- ✅ Fait
- 🔲 A faire

## 1. Authentification

- ✅ Inscription (email, mot de passe, pseudo)
- ✅ Connexion par mot de passe
- ✅ Connexion par magic link
- ✅ Verification magic link (`/auth/verify`)
- ✅ Reinitialisation mot de passe (page)
- ✅ Store auth (session, user, guards)
- ✅ Route guards (redirection login/dashboard, redirection pages auth vers dashboard si connecte)
- ✅ Page d'accueil — Bouton "Acceder au tableau de bord" si connecte, sinon boutons connexion/inscription

## 2. Groupes

- ✅ Store groups — CRUD complet (`src/stores/groups.ts`)
  - fetchGroups, fetchGroup, createGroup, createInvitation, joinGroup, leaveGroup, removeMember
- ✅ Dashboard — Liste des groupes + creation inline, redirection auto si un seul groupe (`src/pages/dashboard.vue`)
- ✅ Page groupe — Titre, sous-navigation onglets Parties/Stats/Membres (`src/pages/groups/[id]/index.vue`)
- ✅ Page membres — Liste, badges role, invitation avec copie lien, retirer membre (admin), quitter groupe (`src/pages/groups/[id]/members.vue`)
- ✅ Page invitation — Gestion connecte/non connecte, join auto, erreurs (`src/pages/invite/[code].vue`)

## 3. Migrations Supabase

- ✅ `20260213000001_create_profiles.sql`
- ✅ `20260213000002_create_groups.sql`
- ✅ `20260213000003_create_games.sql`
- ✅ `20260214000001_allow_invitation_lookup.sql` — Permet la lecture des invitations par les non-membres
- ✅ `20260214000002_fix_group_members_rls_recursion.sql` — Fonction `is_group_member()` SECURITY DEFINER
- ✅ `20260214000003_fix_groups_select_policy.sql` — Le createur peut voir son groupe avant d'etre membre
- ✅ `20260217000001_seed_game_formats.sql` — Données initiales des formats (Pioneer, Limité, Commander, Autre)
- ✅ `20260220000001_add_deck_colors.sql` — Table `decks` (bibliothèque du groupe) + colonnes `deck_id` et `deck_colors` sur `game_players`

## 4. Parties

- ✅ Store games — CRUD complet (`src/stores/games.ts`)
  - `PlayerInput` supporte `deckId`, `deckColors` en plus de `deckName`
- ✅ Store decks — CRUD (`src/stores/decks.ts`)
  - `fetchDecks(groupId)`, `createDeck(params)`
- ✅ Formulaire nouvelle partie (`src/pages/groups/[id]/games/new.vue`)
  - `DeckSelector` par joueur, validation couleurs requises, sauvegarde en bibliothèque avant soumission
- ✅ Detail/modification/suppression d'une partie (`src/pages/groups/[id]/games/[gameId].vue`)
  - Affichage `ManaColors` en lecture seule, `DeckSelector` en mode édition
- ✅ Historique des parties avec filtres dans la page groupe (onglet Parties)
  - Affichage des symboles couleurs MTG en inline dans les badges joueurs

## 5. Statistiques

- 🔲 Page statistiques (`src/pages/groups/[id]/stats.vue`)
- 🔲 Win rate joueur/deck, classement, series de victoires
- 🔲 Filtres par format et periode

## 6. Profil

- 🔲 Page profil (`src/pages/profile.vue`)
- 🔲 Modification du pseudo
- 🔲 Modification du mot de passe

## 7. PWA

- ✅ Manifest (nom, icones, couleur theme, mode standalone)
- ✅ Service worker minimal (installable, prompt d'installation)
- ✅ Logo SVG

## 8. Composants

- ✅ `ManaColors.vue` — Affichage/sélection des couleurs MTG (W/U/B/R/G/C) avec palette de couleurs authentique, modes interactif et lecture seule, tailles `sm` / `md`
- ✅ `DeckSelector.vue` — Sélecteur hybride : bibliothèque du groupe (dropdown) ou saisie libre (nom + couleurs + option enregistrement bibliothèque)
- ✅ `PWAInstallPrompt.vue` — Invite d'installation PWA
