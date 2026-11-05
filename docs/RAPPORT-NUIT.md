# Rapport de la nuit — ce qui a changé

Jeu en ligne : https://nicolasbroekmans-sketch.github.io/les-septs-couronnes/
(GitHub Pages met environ une minute à publier chaque mise à jour.)

## 1. Missions et villes mieux expliquées
- « ! » doré au-dessus des personnages qui ont une mission, « ? » au-dessus de ceux à retrouver.
- Une colonne de lumière dorée marque l'objectif suivi, visible de loin.
- Sous chaque nom, le rôle est écrit : Marchand, Garde, Mendiant, Recruteur, Capitaine de guerre, « A besoin d'aide »…
- Les couleurs des noms changent : rouge = hostile, bleu = marchand, vert = compagnon.
- Des conseils s'affichent au bon moment (première quête, premier combat, premier marchand…).
- **G** ouvre le Guide (« que faire maintenant ? »), **M** la carte de la région avec sa légende.

## 2. Inventaire, armures, améliorations
- L'inventaire s'ouvre avec **R**, **T**, **I** ou **Tab**.
- Les forgerons (Torvald à Winterfell, Dalla à Port-Réal) améliorent armes et armures de +1 à +3 : +12 % de dégâts ou d'armure par niveau.

## 3. Villes plus grandes et plus fidèles
- **Winterfell** :
  - douves gelées, pont, tour de la cloche, Premier Donjon et ses gargouilles ;
  - jardins de verre, entrée des cryptes, passerelle couverte, écuries, aire d'archerie ;
  - Tour brisée au sommet effondré, bannières au loup ;
  - Winter Town agrandie avec sa place du marché et un camp de recrutement.
- **Port-Réal** : Fosse aux Dragons, porte des Dieux, Culpucier, marché, quais, bannières au lion et au cerf, maisons avec fenêtres.
- **Châteaunoir** : palissade, tours, forge, bannières au corbeau.

## 4. Interactions
- **Mendiants** : on peut leur donner 1 ou 10 pièces (karma). Ils racontent leur histoire et, s'ils vous font confiance, révèlent une cachette.
- **Passants** : demandez-leur une pièce. Parfois ils donnent, souvent ils refusent (« Ah non, je n'ai pas envie », « Va travailler ! »). Et ils s'en souviennent.
- **Rumeurs** : chaque ville a les siennes (« Quelles sont les nouvelles ? »).

## 5. Quête « Personne » (Sans-Visage), à Port-Réal
1. Faites l'aumône.
2. Un étranger de Braavos vous remet une pièce de fer.
3. Il vous confie un nom.
4. Éliminez la cible **sans être vu** : l'attaque furtive (C) inflige ×2 dégâts.
5. Récompense : le titre « Personne » et un cosmétique exclusif.

## 6. Fidélisation
- **Cadeau mystère toutes les 15 minutes de jeu** : teintes d'armure, capes, tuniques, titres, blasons, de « commune » à « légendaire ».
- **Profil (P)** : équipez vos cosmétiques et suivez vos statistiques de partie. Le compte à rebours du prochain cadeau y est affiché.

## 7. Armée et grandes batailles
- **Recruteur** dans chaque ville. Il propose :
  - des lanciers (15 or) et des archers (22 or) ;
  - des hommes d'armes (45 or, à partir du niveau 3) ;
  - des chevaliers (100 or, à partir du niveau 5, renommée 15).
- **Capacité** de l'armée : elle grandit avec le niveau, la renommée et l'aptitude Commandement.
- **Compagnons** (jusqu'à 4, onglet **B**) : ils vous suivent partout et vous défendent. S'ils meurent, ils sont perdus.
- **Capitaine de guerre** : à partir du niveau 3, une fois la quête principale de la ville terminée, il lance la grande bataille.
  - Elle oppose environ 100 combattants : vos hommes + ses soldats contre l'ennemi.
  - Ordres : **1** charger, **2** tenir, **3** me suivre.
  - Quand une armée perd sept hommes sur dix, elle fuit.
  - Victoire : or, XP, renommée, réputation, une cape d'exception.
  - Les pertes sont retirées de votre armée.
- Les trois batailles :
  - **Port-Réal** : la route royale, contre les Chardons ;
  - **Winterfell** : le Bois-aux-Loups, contre les pillards fer-nés ;
  - **Le Mur** : l'assaut de Châteaunoir, contre les sauvageons.

## Vérifications faites (réelles)
- 43 tests automatiques au vert, dont une bataille simulée sans affichage : 40 soldats contre 20, avec les vrais cerveaux et le vrai combat. On vérifie que des soldats meurent et que le camp le plus fort gagne.
- Audit au vert : aucun fichier de plus de 200 lignes, pas d'import cassé, pas de dépendance circulaire.
- Bataille testée dans un vrai navigateur :
  - 92 soldats sur le champ ;
  - le combat a bien lieu, la victoire est enregistrée ;
  - retour à Winterfell avec 2 compagnons ;
  - 0 erreur JavaScript.
- Le résultat du scénario complet (de la création du personnage à la sauvegarde) est donné plus bas.

## Limites connues
- Sur un ordinateur modeste, la bataille à 100 combattants peut ralentir. Le réglage « Qualité : basse » aide.
- On ne peut pas sauvegarder pendant une bataille : c'est voulu.
