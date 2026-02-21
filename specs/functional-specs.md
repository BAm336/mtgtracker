# MTG Tracker - Specifications fonctionnelles

## 1. Authentification

### 1.1 User Stories

| ID    | En tant que...   | Je veux...                                      | Afin de...                                    |
| ----- | ---------------- | ----------------------------------------------- | --------------------------------------------- |
| AU-01 | Visiteur         | Creer un compte avec email et mot de passe      | Acceder a l'application                       |
| AU-02 | Visiteur         | Me connecter via un magic link envoye par email  | Me connecter sans retenir de mot de passe     |
| AU-03 | Visiteur         | Me connecter avec email et mot de passe         | Acceder a mon compte                          |
| AU-04 | Utilisateur      | Me deconnecter                                  | Securiser mon acces                           |
| AU-05 | Utilisateur      | Reinitialiser mon mot de passe                  | Recuperer l'acces a mon compte                |

### 1.2 Regles metier

- L'adresse email doit etre unique dans le systeme
- Le mot de passe doit contenir au minimum 8 caracteres
- Le magic link expire apres 15 minutes
- Le magic link est a usage unique
- Une session authentifiee expire apres 7 jours d'inactivite
- Un utilisateur doit definir un pseudo (unique, affiche dans l'application) lors de l'inscription

### 1.3 Parcours utilisateur : Inscription

1. Le visiteur arrive sur la page d'accueil
2. Il clique sur "Creer un compte"
3. Il saisit : pseudo, email, mot de passe, confirmation du mot de passe
4. Le systeme valide les donnees (email unique, mot de passe conforme, pseudo unique)
5. Le compte est cree, l'utilisateur est connecte et redirige vers le tableau de bord

### 1.4 Parcours utilisateur : Connexion par mot de passe

1. L'utilisateur saisit son email et son mot de passe
2. Le systeme verifie les identifiants
3. En cas de succes, l'utilisateur est redirige vers le tableau de bord
4. En cas d'echec, un message d'erreur generique est affiche ("Email ou mot de passe incorrect")

### 1.5 Parcours utilisateur : Connexion par magic link

1. L'utilisateur saisit son email
2. Le systeme envoie un lien de connexion par email
3. L'utilisateur clique sur le lien dans l'email
4. Le systeme verifie la validite du lien (expiration, usage unique)
5. L'utilisateur est connecte et redirige vers le tableau de bord

---

## 2. Profil utilisateur

### 2.1 User Stories

| ID    | En tant que...   | Je veux...                                      | Afin de...                                    |
| ----- | ---------------- | ----------------------------------------------- | --------------------------------------------- |
| PR-01 | Utilisateur      | Modifier mon pseudo                             | Mettre a jour mon identite                    |
| PR-02 | Utilisateur      | Modifier mon mot de passe                       | Securiser mon compte                          |

### 2.2 Regles metier

- Le pseudo doit rester unique dans le systeme
- Le pseudo doit contenir entre 2 et 30 caracteres
- Le pseudo ne peut contenir que des lettres, chiffres, tirets et underscores

---

## 3. Groupes

### 3.1 User Stories

| ID    | En tant que...   | Je veux...                                          | Afin de...                                        |
| ----- | ---------------- | --------------------------------------------------- | ------------------------------------------------- |
| GR-01 | Utilisateur      | Creer un groupe                                     | Rassembler mes amis joueurs                       |
| GR-02 | Membre du groupe | Generer un lien/code d'invitation                   | Inviter de nouveaux joueurs                        |
| GR-03 | Utilisateur      | Rejoindre un groupe via un lien/code d'invitation   | Participer aux parties du groupe                   |
| GR-04 | Membre du groupe | Voir la liste des membres du groupe                 | Savoir qui fait partie du groupe                   |
| GR-05 | Admin du groupe  | Retirer un membre du groupe                         | Gerer la composition du groupe                     |
| GR-06 | Membre du groupe | Quitter un groupe                                   | Ne plus faire partie du groupe                     |
| GR-07 | Utilisateur      | Appartenir a plusieurs groupes                      | Jouer avec differents cercles d'amis               |
| GR-08 | Admin du groupe  | Modifier le nom du groupe                           | Personnaliser le groupe                            |

### 3.2 Regles metier

- Le createur d'un groupe en devient automatiquement l'administrateur
- Un groupe doit avoir au moins un administrateur
- Si le dernier administrateur quitte le groupe, le membre le plus ancien devient administrateur
- Un code d'invitation est une chaine alphanumerique de 8 caracteres
- Un code d'invitation expire apres 7 jours
- Un code d'invitation peut etre utilise par plusieurs personnes (tant qu'il n'a pas expire)
- Un utilisateur ne peut pas rejoindre un groupe dont il est deja membre
- Le nom du groupe doit contenir entre 2 et 50 caracteres
- Un joueur peut appartenir a un maximum de 20 groupes

### 3.3 Parcours utilisateur : Creer un groupe

1. L'utilisateur clique sur "Creer un groupe"
2. Il saisit le nom du groupe
3. Le groupe est cree, l'utilisateur en est membre et administrateur
4. Il est redirige vers la page du groupe

### 3.4 Parcours utilisateur : Inviter un ami

1. Le membre clique sur "Inviter" dans la page du groupe
2. Le systeme genere un code d'invitation (et un lien associe)
3. Le membre copie le lien et l'envoie a son ami (par messagerie externe)
4. L'ami clique sur le lien ou saisit le code sur la page de l'application
5. Si l'ami est connecte, il rejoint le groupe immediatement
6. Si l'ami n'est pas connecte, il est redirige vers la connexion/inscription, puis rejoint le groupe

---

## 4. Parties

### 4.1 User Stories

| ID    | En tant que...   | Je veux...                                          | Afin de...                                        |
| ----- | ---------------- | --------------------------------------------------- | ------------------------------------------------- |
| GA-01 | Membre du groupe | Enregistrer une nouvelle partie                     | Garder une trace du resultat                       |
| GA-02 | Membre du groupe | Choisir les joueurs participants (2 a 4)            | Definir qui a joue                                 |
| GA-03 | Membre du groupe | Indiquer le gagnant                                 | Comptabiliser les victoires                        |
| GA-04 | Membre du groupe | Indiquer le deck utilise par chaque joueur (avec ses couleurs MTG) | Suivre les performances par deck et par couleur |
| GA-04b | Membre du groupe | Choisir un deck dans la bibliotheque partagee du groupe | Reutiliser un deck sans ressaisir ses informations |
| GA-04c | Membre du groupe | Enregistrer un nouveau deck dans la bibliotheque lors de la saisie | Enrichir la bibliotheque du groupe au fil des parties |
| GA-05 | Membre du groupe | Indiquer le commandant pour le format Commander     | Suivre les performances par commandant             |
| GA-06 | Membre du groupe | Choisir le format de jeu                            | Categoriser les parties                            |
| GA-07 | Membre du groupe | Indiquer la date de la partie                       | Avoir un historique chronologique                  |
| GA-08 | Membre du groupe | Consulter l'historique des parties du groupe        | Revoir les resultats passes                        |
| GA-09 | Membre du groupe | Modifier une partie enregistree                     | Corriger une erreur de saisie                      |
| GA-10 | Membre du groupe | Supprimer une partie enregistree                    | Retirer une partie saisie par erreur               |
| GA-11 | Membre du groupe | Filtrer l'historique par format, joueur ou date     | Trouver facilement une partie                      |

### 4.2 Regles metier

- Une partie appartient a un groupe
- Une partie a exactement un gagnant parmi les participants
- Le nombre de joueurs est compris entre 2 et 4
- Les joueurs participants doivent etre membres du groupe
- Les formats de jeu par defaut sont : Pioneer, Limite, Commander, Autre
- De nouveaux formats peuvent etre ajoutes (la liste est extensible)
- Le deck peut etre selectionne depuis la bibliotheque partagee du groupe, ou saisi librement
- Les couleurs du deck sont obligatoires pour chaque joueur (W=Blanc, U=Bleu, B=Noir, R=Rouge, G=Vert, C=Incolore)
- La couleur Incolore (C) est mutuellement exclusive avec les autres couleurs
- Lors d'une saisie libre, le membre peut choisir d'enregistrer le deck dans la bibliotheque du groupe
- Les couleurs sont toujours stockees en snapshot sur la partie (pour historique stable)
- Le nom du deck est un texte libre (max 100 caracteres), facultatif si un deck de la bibliotheque est selectionne
- Le nom du commandant est un texte libre (max 100 caracteres), facultatif sauf pour le format Commander
- Pour le format Commander, le champ commandant est obligatoire pour chaque joueur
- La date de la partie est par defaut la date du jour, mais peut etre modifiee
- N'importe quel membre du groupe peut saisir une partie pour le groupe (pas seulement les participants)
- N'importe quel membre du groupe peut modifier ou supprimer une partie du groupe

### 4.3 Parcours utilisateur : Enregistrer une partie

1. Le membre ouvre la page du groupe et clique sur "Nouvelle partie"
2. Il selectionne le format de jeu (liste deroulante)
3. Il selectionne les joueurs participants (2 a 8) parmi les membres du groupe
4. Pour chaque joueur, il renseigne son deck :
   - Soit il choisit un deck existant dans la bibliotheque partagee du groupe (nom + couleurs pre-remplis)
   - Soit il saisit librement le nom (optionnel) et les couleurs (obligatoire), avec option pour sauvegarder dans la bibliotheque
   - Le nom du commandant (texte libre, affiche uniquement si format = Commander)
5. Il selectionne le gagnant parmi les joueurs participants
6. Il confirme ou modifie la date (pre-remplie avec la date du jour)
7. Il valide la saisie
8. La partie est enregistree et apparait dans l'historique

### 4.4 Parcours utilisateur : Consulter l'historique

1. Le membre ouvre la page du groupe
2. L'historique des parties s'affiche (les plus recentes en premier)
3. Il peut filtrer par :
   - Format de jeu
   - Joueur participant
   - Plage de dates
4. Il peut cliquer sur une partie pour voir le detail

---

## 5. Statistiques

### 5.1 User Stories

| ID    | En tant que...   | Je veux...                                              | Afin de...                                    |
| ----- | ---------------- | ------------------------------------------------------- | --------------------------------------------- |
| ST-01 | Membre du groupe | Voir le classement des joueurs du groupe                | Comparer nos performances                     |
| ST-02 | Membre du groupe | Voir le win rate de chaque joueur                       | Evaluer le niveau de chacun                   |
| ST-03 | Membre du groupe | Voir le win rate par deck                               | Identifier les decks performants              |
| ST-04 | Membre du groupe | Voir mes series de victoires (actuelles et meilleures)  | Suivre mes performances                       |
| ST-05 | Membre du groupe | Filtrer les statistiques par format                     | Analyser par format de jeu                    |
| ST-06 | Membre du groupe | Filtrer les statistiques par periode                    | Voir l'evolution dans le temps                |

### 5.2 Regles de calcul

#### Win rate joueur

```
win_rate = nombre_de_victoires / nombre_de_parties_jouees * 100
```

- Exprime en pourcentage, arrondi a une decimale
- Calcule sur l'ensemble des parties du groupe (ou filtre par format/periode)

#### Win rate par deck

```
win_rate_deck = victoires_avec_ce_deck / parties_jouees_avec_ce_deck * 100
```

- Un deck est identifie par son nom exact (sensible a la casse)
- Affiche uniquement si le deck a ete utilise dans au moins 2 parties

#### Classement

- Le classement est ordonne par win rate decroissant
- En cas d'egalite de win rate, le joueur ayant le plus de victoires est classe devant
- En cas d'egalite de victoires, le joueur ayant le plus de parties est classe devant

#### Serie de victoires

- La serie actuelle correspond au nombre de victoires consecutives du joueur (ses parties les plus recentes)
- La meilleure serie correspond a la plus longue sequence de victoires consecutives du joueur
- Les parties sont ordonnees par date pour le calcul des series
- Seules les parties auxquelles le joueur a participe comptent

### 5.3 Tableau de bord du groupe

Le tableau de bord affiche :

1. **Classement** : tableau avec pseudo, parties jouees, victoires, win rate, serie actuelle
2. **Derniere partie** : resume de la derniere partie enregistree
3. **Top decks** : les 5 decks avec le meilleur win rate (min 2 parties)
4. **Filtres** : par format de jeu, par periode (tout, 30 derniers jours, 90 derniers jours, annee en cours)

---

## 6. Interface utilisateur - Structure des pages

### 6.1 Pages publiques (non authentifie)

| Page                | URL                  | Description                              |
| ------------------- | -------------------- | ---------------------------------------- |
| Accueil             | `/`                  | Presentation ; si connecte, bouton "Acceder au tableau de bord" ; sinon, boutons connexion/inscription |
| Inscription         | `/register`          | Formulaire de creation de compte         |
| Connexion           | `/login`             | Formulaire de connexion                  |
| Magic link confirm  | `/auth/verify`       | Page de confirmation du magic link       |
| Reset mot de passe  | `/reset-password`    | Formulaire de reinitialisation           |
| Invitation          | `/invite/:code`      | Page d'acceptation d'invitation          |

### 6.2 Pages authentifiees

| Page                    | URL                          | Description                                    |
| ----------------------- | ---------------------------- | ---------------------------------------------- |
| Tableau de bord         | `/dashboard`                 | Liste des groupes, acces rapide. Redirection automatique vers le groupe si l'utilisateur n'appartient qu'a un seul groupe |
| Profil                  | `/profile`                   | Modification pseudo, mot de passe              |
| Groupe                  | `/groups/:id`                | Page principale du groupe (stats + historique)  |
| Membres du groupe       | `/groups/:id/members`        | Liste et gestion des membres                   |
| Nouvelle partie         | `/groups/:id/games/new`      | Formulaire de saisie de partie                 |
| Detail d'une partie     | `/groups/:id/games/:gameId`  | Detail et modification d'une partie            |
| Statistiques du groupe  | `/groups/:id/stats`          | Statistiques detaillees du groupe              |

### 6.3 Navigation

- **Header** : logo/nom de l'app (cliquable, redirige vers la page d'accueil), navigation principale, menu utilisateur (profil, deconnexion)
- **Page de groupe** : onglets ou sous-navigation (Parties, Statistiques, Membres)
- **Mobile** : navigation responsive, menu hamburger sur petits ecrans

---

## 7. Notifications et feedback

| Evenement                          | Type de feedback                      |
| ---------------------------------- | ------------------------------------- |
| Inscription reussie                | Message de succes + redirection       |
| Connexion reussie                  | Redirection vers tableau de bord      |
| Deconnexion                        | Redirection vers la page d'accueil    |
| Erreur de connexion                | Message d'erreur en rouge             |
| Magic link envoye                  | Message de confirmation               |
| Groupe cree                        | Message de succes + redirection       |
| Invitation copiee                  | Toast "Lien copie dans le presse-papier" |
| Groupe rejoint                     | Message de succes + redirection       |
| Partie enregistree                 | Message de succes + retour historique |
| Partie modifiee                    | Message de succes                     |
| Partie supprimee                   | Confirmation avant suppression + message de succes |
| Erreur de validation (formulaire)  | Messages d'erreur sous les champs    |
| Erreur serveur                     | Message d'erreur generique            |
