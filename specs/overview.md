# MTG Tracker - Vue d'ensemble du projet

## 1. Vision

MTG Tracker est une application web progressive (PWA) de suivi de parties Magic: The Gathering entre amis. Elle s'adresse a un groupe de joueurs casual souhaitant enregistrer leurs parties, suivre leurs statistiques et comparer leurs performances au sein d'un groupe.

Le projet a egalement une vocation educative : il sert de support pour apprendre a developper une application web moderne en s'appuyant sur l'assistance d'une IA.

## 2. Objectifs

### Objectifs fonctionnels

- Permettre a des joueurs de creer un compte et de rejoindre un groupe d'amis
- Enregistrer les resultats de parties de Magic: The Gathering (formats multiples, 2 a 4 joueurs)
- Calculer et afficher des statistiques individuelles et de groupe (win rate, classement, series)
- Offrir un historique complet et consultable des parties jouees

### Objectifs techniques

- Construire une application web moderne, responsive, installable (PWA)
- Separer clairement le frontend et le backend (repertoires distincts, API REST)
- Produire un code clair, bien structure, suivant les bonnes pratiques
- Faciliter l'apprentissage : chaque choix technique doit etre comprehensible et documente

### Objectifs educatifs

- Apprendre les bases du developpement full-stack (frontend, backend, base de donnees, API)
- Comprendre l'architecture d'une application web moderne
- Pratiquer le developpement assiste par IA de maniere structuree

## 3. Perimetre

### MVP (Minimum Viable Product)

| Domaine          | Inclus dans le MVP                                                    |
| ---------------- | --------------------------------------------------------------------- |
| Authentification | Email/mot de passe, magic link                                        |
| Groupes          | Creation, invitation, gestion des membres                             |
| Parties          | Saisie, consultation, modification (2-4 joueurs, formats multiples)   |
| Statistiques     | Win rate joueur/deck, classement groupe, historique, series victoires  |
| PWA              | Manifest, service worker minimal (installable, pas de mode offline)   |

### Evolutions futures (hors MVP)

| Domaine          | Description                                                           |
| ---------------- | --------------------------------------------------------------------- |
| Offline          | Fonctionnement deconnecte avec synchronisation                        |
| OIDC             | Connexion via Google, Discord, etc.                                   |
| Decks avances    | Gestion de listes de cartes                                           |
| Scryfall         | Integration API Scryfall pour autocompletion des commandants/cartes   |
| Branding         | Nom definitif et identite visuelle de l'application                   |

## 4. Utilisateurs cibles

- **Joueur casual** : joue regulierement avec un groupe d'amis, veut suivre ses stats sans prise de tete
- **Groupe d'amis** : 2 a ~15 joueurs qui se retrouvent pour jouer et veulent un classement amical
- Un seul joueur du groupe peut saisir les resultats pour tout le monde (pas besoin que chaque joueur confirme)

## 5. Principes directeurs

1. **Simplicite** : l'application doit etre simple a utiliser. Un joueur doit pouvoir enregistrer une partie en moins de 30 secondes.
2. **Flexibilite** : les formats de jeu sont extensibles, les noms de decks et commandants sont en texte libre (pas de contrainte de validation externe au MVP).
3. **Clarte du code** : le code doit etre lisible, commente quand necessaire, et organise de maniere standard.
4. **Evolutivite** : l'architecture doit permettre d'ajouter les evolutions futures sans refonte majeure.

## 6. Structure du projet

```
mtgapp/
  frontend/     # Application frontend (SPA)
  backend/      # API backend (REST)
  specs/        # Specifications du projet (ce repertoire)
```

## 7. Documents de reference

| Document                | Fichier                | Description                                      |
| ----------------------- | ---------------------- | ------------------------------------------------ |
| Specs fonctionnelles    | `functional-specs.md`  | User stories, parcours utilisateur, regles metier |
| Modele de donnees       | `data-model.md`        | Entites, relations, attributs, RLS policies       |
| Specs techniques        | `technical-specs.md`   | Stack, architecture, structure projet, PWA        |
