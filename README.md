# Les Sept Couronnes — RPG dans l'univers du Trône de fer (fan game)

Jeu de rôle 3D jouable dans le navigateur. Vous commencez comme un inconnu à **Port-Réal**, **Winterfell** ou **au Mur**. Vous parlez aux habitants, acceptez des quêtes, combattez des ennemis pilotés par une IA, progressez et façonnez votre réputation.

> Projet de fan **non commercial et non officiel**, sans lien avec HBO, ni avec George R. R. Martin, ni avec leurs éditeurs. Il n'utilise aucune image, musique, logo ni portrait officiel. Tous les personnages jouables et les textes sont originaux ; les grandes maisons n'apparaissent qu'en toile de fond. L'époque est fixée en **298 après la Conquête**.

## Lancer le jeu

Le jeu n'a pas besoin d'être compilé, mais il faut un petit serveur local (modules ES) :

```bash
npx serve .
```

ou

```bash
python -m http.server 8000
```

Une connexion Internet est nécessaire pour les CDN (Three.js, GSAP, Howler.js) et Google Fonts.

**Dans WordPress :** installez `got-demo.zip` (Extensions → Ajouter → Téléverser), activez l'extension, puis insérez le code court `[GOT_demo]`.

## Commandes

| Action | Touche |
|---|---|
| Se déplacer | **ZQSD** (AZERTY) ou **WASD** (QWERTY), ou les flèches. Les touches sont lues par leur position physique. |
| Caméra | souris (cliquez pour capturer le pointeur), molette pour zoomer |
| Courir / furtivité | Maj / C |
| Attaque légère / lourde | clic gauche / clic gauche **maintenu** |
| Parer | clic droit maintenu. Parer juste avant l'impact (parade parfaite) déséquilibre l'adversaire. |
| Esquive (roulade) | Espace |
| Interagir (parler, fouiller, prendre) | E |
| Se soigner | H |
| Inventaire | I, R, T ou Tab |
| Compétences / Journal / Factions / Carte et voyages / Guide / Profil / Armée / Classement | K / J / L / M / G / P / B / O |
| Ordres en bataille : charger / tenir / me suivre | 1 / 2 / 3 |
| Pause, sauvegarde, chargement, paramètres | Échap |
| Choix dans les dialogues | clic ou touches 1 à 9 |

## Ce qui est jouable aujourd'hui (phase 1)

1. Menu principal : nouvelle partie, continuer, charger, mode découverte, paramètres.
2. Création du personnage : nom, sexe, âge, origine (8 régions), 6 classes, 4 difficultés, apparence avec aperçu 3D, histoire personnelle. Les classes, origines, âge et difficulté modifient réellement les statistiques.
3. Choix du point de départ sur la carte interactive : Port-Réal, Winterfell ou le Mur. Chaque lieu a ses PNJ, ses marchands, ses dangers et ses quêtes.
4. Exploration à la troisième personne : collisions, escaliers, cycle jour/nuit, météo selon le climat, mini-carte, boussole avec repère d'objectif, points d'intérêt qui rapportent de l'XP d'exploration.
5. PNJ avec des routines : les villageois sont sur la place le jour et rentrent chez eux la nuit. Les gardes patrouillent. Les marchands ont un stock persistant.
6. Dialogues ramifiés, avec tests de persuasion déterministes (charisme + aptitude Diplomatie + talents).
7. Combat en temps réel : attaques légère et lourde, parade et parade parfaite, garde brisée, esquive avec invulnérabilité, endurance, critiques, armure, 13 armes dont l'arc et l'arbalète (projectiles balistiques).
8. Ennemis pilotés par une IA hybride (détails plus bas). Ils peuvent fuir, appeler des renforts ou se rendre. Un ennemi épargné peut devenir un allié : Wat devient apprenti à la forge.
9. Cinq quêtes complètes, avec choix et conséquences :
   - **Port-Réal**, *Les bandits de la route royale* : combattre, négocier ou trahir le marchand (puis mentir ou être démasqué) ; elle débloque *Le sceau du marchand*.
   - **Winterfell**, *Le fer volé* : rendre ou garder le fer ; elle débloque *Un nouvel apprenti*.
   - **Le Mur**, *Une nuit au Mur* : patrouille au-delà du Mur par le tunnel, embuscade, puis libérer, emprisonner ou exécuter une sauvageonne ; elle débloque *Le rapport*.
10. Progression : XP, niveaux, 18 talents répartis en 6 arbres (combat, survie, commerce, diplomatie, commandement, furtivité), points d'attribut, et aptitudes qui progressent avec la pratique.
11. Inventaire, équipement (l'armure change l'apparence), consommables, commerce aux prix régionaux, vol à l'étal. Un marchand qui vous surprend s'en souvient, refuse de commercer et alerte la garde.
12. Factions et réputation (16 factions, propagation aux alliés et aux ennemis), crimes et primes, PNJ dotés de mémoire (relation et souvenirs datés).
13. Sauvegardes : 3 emplacements, sauvegarde automatique, versionnage avec migrations, relecture de vérification. Mort : recharger la dernière sauvegarde ou se relever en perdant 20 % de son or.
14. Mode découverte : visite libre des 16 lieux de la première version.
15. Clarté : « ! » et « ? » au-dessus des PNJ à quête, colonne de lumière sur l'objectif suivi, rôle affiché sous chaque nom (marchand, garde, mendiant, recruteur…), conseils contextuels, onglet Guide (que faire maintenant) et carte de région légendée (M).
16. Interactions : mendiants à qui donner 1 ou 10 pièces (karma, histoire, secret s'ils vous font confiance), passants qui donnent parfois une pièce ou refusent (« Ah non, je n'ai pas envie »), rumeurs propres à chaque ville.
17. Quête « Personne » à Port-Réal : une pièce de fer, un étranger de Braavos, une cible à éliminer sans être vu (attaque furtive ×2), titre et cosmétique exclusifs.
18. Rétention : un cadeau mystère toutes les 15 minutes de jeu (teintes d'armure, capes, tuniques, titres, blasons, de commune à légendaire), profil personnalisable (P), amélioration des armes et armures à la forge (+1 à +3).
19. Armée : recruteurs et capitaines de guerre dans chaque ville, 4 types de troupes, capacité selon niveau/renommée/Commandement, jusqu'à 4 compagnons qui suivent et défendent le héros, et trois grandes batailles (≈ 100 combattants, rendu instancié) avec ordres, moral, déroute, récompenses et pertes définitives.
20. Villes agrandies : Winterfell (douves, pont, tour de la cloche, Premier Donjon, jardins de verre, cryptes, Winter Town et son marché), Port-Réal (Fosse aux Dragons, porte des Dieux, Culpucier, quais, marché), Châteaunoir (palissade, tours, forge).

**Pas encore développé** (phases suivantes) : voyages sur la carte du monde avec événements, régions d'Essos jouables, gestion de domaine et bâtiments, cavalerie.

## Architecture

Le jeu est écrit en modules ES sans framework, avec Three.js r170. La règle est **moins de 200 lignes par fichier**, vérifiée par `tools/audit.mjs`. Toute la **logique de jeu est indépendante du rendu**, ce qui permet de la tester dans Node.

```
js/
  core/       EventBus, GameState, SaveManager (versions et migrations), Conditions et Effects déclaratifs, Random déterministe
  data/       classes, objets, talents, factions, lieux ; quests/, dialogues/ et regions/ par région
  player/     Character (création), Stats (statistiques dérivées), Inventory, Progression
  combat/     DamageSystem (pur), Fighter (machine à états de combat), CombatSystem (portée, arc, ciblage), Projectiles
  ai/         NeuralModel (MLP), Tactics (réseau et IA utilitaire), DuelSim (simulateur d'entraînement),
              NPCBrain (machine à états et perception), CombatBehavior, Steering, Pathfinding (A*), Memory
  quests/     QuestEngine (étapes, objectifs, branches, échecs), QuestRewards, QuestRegistry (validation)
  dialogue/   DialogueEngine, GenericDialogues (reddition, amende, marchand méfiant)
  factions/   Reputation        economy/  Markets, Trading        world/  WorldClock (jour, nuit, météo)
  engine/     Renderer (post-traitement), SceneLoader, SceneContext et builders/, Physics (grille spatiale, rayons),
              Humanoid (personnages animés), Weapons3D, CameraRig, Input, Particles, Nameplate
  game/       Game (orchestration), GameLoop, GameCore (logique sans rendu), RegionRuntime, Actor, PlayerController,
              CombatDirector, Interaction, Hostility, WorldRules, GameEvents
  ui/         UI (façade), hud/, panels/, menus/, map/, Toasts, Floaters, Icons
  scenes/     décors procéduraux des 16 lieux (light/ pour les lieux légers)
tests/        tests Node (node --test) et e2e/ (scénario Playwright)
tools/        audit.mjs, train-tactics.mjs, ai-report.json, make-models.html
```

Les systèmes communiquent par le **bus d'événements** : `npc:talk`, `marker:reached`, `npc:defeated`, `quest:signal`, `inventory:changed`… Les quêtes, dialogues et apparitions de PNJ sont des **données déclaratives** (conditions et effets sérialisables), ce qui garde les sauvegardes simples et rend les tests fiables.

### Intelligence artificielle des PNJ

Elle est **hybride** : chaque technique est utilisée là où elle apporte quelque chose.

| Rôle | Technique |
|---|---|
| Routines, patrouilles, alerte, fuite, reddition | Machine à états (`ai/NPCBrain.js`) |
| Perception | Champ de vision, ligne de vue par lancer de rayon, ouïe, nuit, furtivité du joueur |
| Navigation | A* sur une grille construite à partir des collisions, lissage par ligne de vue, budget de 3 calculs par image |
| Décision tactique en combat | Petit réseau neuronal (MLP 11 → 16 → 7), avec repli sur une IA utilitaire |
| Mémoire | Relation, souvenirs datés et drapeaux persistants par PNJ |

Le réseau reçoit 11 entrées : distance, PV, endurance, PV de la cible, alliés, ennemis, menace, arme à distance, moral, agressivité, cible en garde. Il choisit entre 7 actions : attaquer, reculer, esquiver, se défendre, fuir, appeler à l'aide, changer de cible. Il n'est consulté que **toutes les 0,3 s environ** par PNJ en combat ; les PNJ éloignés de plus de 90 m sont simulés à fréquence réduite.

**Entraînement reproductible** (`node tools/train-tactics.mjs`, graine 2026, environ 20 s) :
1. Imitation de l'IA utilitaire : 20 000 situations, précision **91,7 %**.
2. Stratégie d'évolution (OpenAI-ES, 40 individus, 120 générations) dans un simulateur de duel qui utilise les **vrais** modules `Fighter` et `DamageSystem`.

Résultats sur **400 duels jamais vus** (`tools/ai-report.json`) :

| Politique | Victoires | Survie |
|---|---|---|
| Aléatoire | 5 % | 5 % |
| IA utilitaire (écrite à la main) | 53 % | 60 % |
| Réseau, imitation seule | 52 % | 61 % |
| **Réseau après évolution (utilisé en jeu)** | **78 %** | **90 %** |

Le réseau évolué a appris à espacer ses attaques et à reprendre ses distances. Répartition de ses actions : attaque 54 %, recul 12 %, esquive 13 %, fuite 14 %, contre 78 % d'attaques pour l'IA utilitaire.

Précision importante : **les PNJ n'apprennent pas pendant la partie**. Les poids sont figés après l'entraînement. Le paramètre « IA tactique » des réglages permet de comparer en jeu le réseau et l'IA utilitaire.

## Tests et audit

```bash
npm test
```

```bash
npm run audit
```

```bash
node tests/e2e/rpg-flow.mjs
```

- `npm test` lance les tests Node : création du personnage, dégâts, parade, Fighter, combat spatial, inventaire, progression, réputation, commerce et vol, horloge, quêtes (toutes les branches), sauvegarde et migrations, MLP, IA utilitaire, simulateur, A*, poids livrés, cohérence quêtes/régions/dialogues.
- `npm run audit` vérifie la limite de lignes, les imports et exports, les dépendances circulaires et les ressources manquantes.
- `node tests/e2e/rpg-flow.mjs` joue un scénario complet dans un vrai navigateur. Il demande un serveur sur le port 8765 et Playwright. Le bot n'utilise que les entrées du joueur (touches, clics, caméra).

## Crédits et licences

- **Ciels HDRI et textures** : [Poly Haven](https://polyhaven.com), licence **CC0**. HDRI réduits en 512×256 et textures en .webp 384 px. Auteurs : Greg Zaal, Jarod Guest, Dimitrios Savva, Sergej Majboroda, Rob Tuytel, Dario Barresi, Amal Kumar, Charlotte Baglioni, Sơn Nguyễn.
- **Personnages, armes, navire, cheval, Titan** : créations procédurales originales, **CC0** (`engine/Humanoid.js`, `engine/Weapons3D.js`, `tools/make-models.html`).
- **Sons et musique** : synthèse procédurale originale, **CC0**.
- **Polices** : Cinzel, Cinzel Decorative (Natanael Gama) et IM Fell English (Igino Marini), sous **SIL OFL 1.1** (Google Fonts).
- **Bibliothèques** : Three.js 0.170 (MIT), GSAP 3.12.5 (licence standard GreenSock), Howler.js 2.2.4 (MIT).
- Tous les textes de quêtes, dialogues et lore sont originaux. *A Song of Ice and Fire* est une œuvre de George R. R. Martin.

### Remplacer les éléments sous licence

Les noms de l'univers (lieux, maisons) sont regroupés dans `js/data/` (places, factions, regions, quests, dialogues). Pour transformer le jeu en univers original, il suffit de remplacer ces données : aucun nom n'est codé en dur dans les moteurs.
