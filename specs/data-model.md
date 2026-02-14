# MTG Tracker - Modèle de données

## 1. Vue d'ensemble

Le modèle de données repose sur Supabase (PostgreSQL). L'authentification est gérée par `auth.users` (table interne Supabase). Les données applicatives sont dans le schéma `public`.

### Diagramme des relations

```
auth.users (Supabase Auth)
    │
    └──< profiles >──────────────────────┐
              │                           │
              └──< group_members >──┐     │
                        │           │     │
                  groups ┘          │     │
                    │               │     │
                    └──< group_invitations    │
                    │                         │
                    └──< games                │
                           │                  │
                           └──< game_players ─┘
```

## 2. Tables

### 2.1 profiles

Extension du compte Supabase Auth avec les données applicatives.

| Colonne      | Type         | Contraintes                | Description                  |
| ------------ | ------------ | -------------------------- | ---------------------------- |
| id           | uuid         | PK, FK → auth.users.id    | Identifiant (même que auth)  |
| username     | varchar(30)  | UNIQUE, NOT NULL           | Pseudo affiché               |
| created_at   | timestamptz  | NOT NULL, DEFAULT now()    | Date de création             |
| updated_at   | timestamptz  | NOT NULL, DEFAULT now()    | Dernière modification        |

**Contraintes :**
- `username` : 2-30 caractères, uniquement lettres, chiffres, tirets, underscores (`^[a-zA-Z0-9_-]{2,30}$`)
- Créé automatiquement à l'inscription via un trigger sur `auth.users`

---

### 2.2 groups

| Colonne      | Type         | Contraintes                | Description                  |
| ------------ | ------------ | -------------------------- | ---------------------------- |
| id           | uuid         | PK, DEFAULT gen_random_uuid() | Identifiant du groupe     |
| name         | varchar(50)  | NOT NULL                   | Nom du groupe                |
| created_by   | uuid         | FK → profiles.id, NOT NULL | Créateur du groupe           |
| created_at   | timestamptz  | NOT NULL, DEFAULT now()    | Date de création             |

**Contraintes :**
- `name` : 2-50 caractères

---

### 2.3 group_members

Table de liaison entre les profils et les groupes.

| Colonne      | Type         | Contraintes                | Description                  |
| ------------ | ------------ | -------------------------- | ---------------------------- |
| group_id     | uuid         | PK, FK → groups.id         | Groupe                       |
| user_id      | uuid         | PK, FK → profiles.id       | Membre                       |
| role         | varchar(10)  | NOT NULL, DEFAULT 'member'  | Rôle : 'admin' ou 'member'  |
| joined_at    | timestamptz  | NOT NULL, DEFAULT now()    | Date d'entrée dans le groupe |

**Contraintes :**
- Clé primaire composite : `(group_id, user_id)`
- `role` : CHECK IN ('admin', 'member')
- Un utilisateur peut appartenir à max 20 groupes (vérifié par policy ou trigger)

---

### 2.4 group_invitations

| Colonne      | Type         | Contraintes                | Description                  |
| ------------ | ------------ | -------------------------- | ---------------------------- |
| id           | uuid         | PK, DEFAULT gen_random_uuid() | Identifiant                |
| group_id     | uuid         | FK → groups.id, NOT NULL    | Groupe concerné             |
| code         | varchar(8)   | UNIQUE, NOT NULL            | Code d'invitation            |
| created_by   | uuid         | FK → profiles.id, NOT NULL  | Membre ayant créé l'invitation |
| expires_at   | timestamptz  | NOT NULL                    | Date d'expiration (created_at + 7 jours) |
| created_at   | timestamptz  | NOT NULL, DEFAULT now()     | Date de création             |

**Contraintes :**
- `code` : 8 caractères alphanumériques, généré aléatoirement
- L'invitation est valide si `expires_at > now()`

---

### 2.5 game_formats

Formats de jeu disponibles. Table de référence extensible.

| Colonne      | Type         | Contraintes                | Description                  |
| ------------ | ------------ | -------------------------- | ---------------------------- |
| id           | uuid         | PK, DEFAULT gen_random_uuid() | Identifiant               |
| name         | varchar(50)  | UNIQUE, NOT NULL            | Nom du format               |

**Données initiales (seed) :**
- Pioneer
- Limité
- Commander
- Autre

---

### 2.6 games

| Colonne      | Type         | Contraintes                | Description                  |
| ------------ | ------------ | -------------------------- | ---------------------------- |
| id           | uuid         | PK, DEFAULT gen_random_uuid() | Identifiant de la partie  |
| group_id     | uuid         | FK → groups.id, NOT NULL    | Groupe                      |
| format_id    | uuid         | FK → game_formats.id, NOT NULL | Format de jeu            |
| played_at    | date         | NOT NULL, DEFAULT CURRENT_DATE | Date de la partie        |
| created_by   | uuid         | FK → profiles.id, NOT NULL  | Membre ayant saisi la partie |
| created_at   | timestamptz  | NOT NULL, DEFAULT now()     | Date de saisie              |
| updated_at   | timestamptz  | NOT NULL, DEFAULT now()     | Dernière modification       |

---

### 2.7 game_players

Joueurs participants à une partie.

| Colonne      | Type          | Contraintes                | Description                  |
| ------------ | ------------- | -------------------------- | ---------------------------- |
| game_id      | uuid          | PK, FK → games.id          | Partie                       |
| user_id      | uuid          | PK, FK → profiles.id       | Joueur                       |
| deck_name    | varchar(100)  | NULL                       | Nom du deck                  |
| commander    | varchar(100)  | NULL                       | Nom du commandant            |
| is_winner    | boolean       | NOT NULL, DEFAULT false     | Ce joueur a-t-il gagné ?     |

**Contraintes :**
- Clé primaire composite : `(game_id, user_id)`
- Exactement un `is_winner = true` par partie (vérifié par trigger ou contrainte applicative)
- 2 à 4 `game_players` par partie (vérifié par trigger ou contrainte applicative)
- `commander` obligatoire si le format de la partie est "Commander" (vérifié côté applicatif)

## 3. Triggers

### 3.1 Création du profil à l'inscription

Quand un utilisateur s'inscrit via Supabase Auth, un trigger crée automatiquement sa ligne dans `profiles` :

```sql
CREATE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3.2 Mise à jour de updated_at

Trigger générique pour mettre à jour `updated_at` automatiquement sur `profiles` et `games` :

```sql
CREATE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 4. Row Level Security (RLS)

Toutes les tables ont RLS activé. Voici les policies principales.

### 4.1 profiles

| Opération | Policy                                                        |
| --------- | ------------------------------------------------------------- |
| SELECT    | Tout utilisateur authentifié peut lire tous les profils        |
| UPDATE    | Un utilisateur ne peut modifier que son propre profil          |

### 4.2 groups

| Opération | Policy                                                        |
| --------- | ------------------------------------------------------------- |
| SELECT    | Un utilisateur voit les groupes dont il est membre             |
| INSERT    | Tout utilisateur authentifié peut créer un groupe              |
| UPDATE    | Seuls les admins du groupe peuvent modifier le groupe          |

### 4.3 group_members

| Opération | Policy                                                        |
| --------- | ------------------------------------------------------------- |
| SELECT    | Un utilisateur voit les membres des groupes dont il fait partie |
| INSERT    | Via invitation (vérification du code) ou création de groupe     |
| DELETE    | L'admin peut retirer un membre ; un membre peut se retirer lui-même |

### 4.4 group_invitations

| Opération | Policy                                                        |
| --------- | ------------------------------------------------------------- |
| SELECT    | Les membres du groupe voient les invitations du groupe         |
| INSERT    | Tout membre du groupe peut créer une invitation                |

### 4.5 games / game_players

| Opération | Policy                                                        |
| --------- | ------------------------------------------------------------- |
| SELECT    | Un utilisateur voit les parties des groupes dont il est membre |
| INSERT    | Tout membre du groupe peut créer une partie                    |
| UPDATE    | Tout membre du groupe peut modifier une partie du groupe       |
| DELETE    | Tout membre du groupe peut supprimer une partie du groupe      |

## 5. Index

| Table             | Colonnes                | Justification                          |
| ----------------- | ----------------------- | -------------------------------------- |
| group_members     | (user_id)               | Lister les groupes d'un utilisateur    |
| games             | (group_id, played_at)   | Historique chronologique par groupe    |
| game_players      | (user_id)               | Statistiques par joueur                |
| group_invitations | (code)                  | Recherche par code d'invitation        |
