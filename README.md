# Jeux de Papa

Application Android pour tablette, en mode paysage et plein écran : 100 niveaux répartis entre 10 jeux (objets cachés, mots mêlés, bonbons, pendu, Zip, Queens, Uno, Puissance 4, Tango, Patches), le Sac de papa (100 objets à collectionner), Papa qui réagit et qui danse, les publicités de la maison, les succès, les bêtisiers cachés et le défi du jour.

## Obtenir l’APK avec GitHub

1. Sur github.com, crée un nouveau dépôt (**+** puis **New repository**).
2. Sur la page du dépôt vide, clique sur **uploading an existing file** et glisse **tout le contenu** du dossier `jeux-de-papa` (pas le zip, pas le dossier lui-même). Valide avec **Commit changes**.
3. Vérifie que le dossier `.github` est présent. S’il manque : **Add file > Create new file**, nom `.github/workflows/build-apk.yml`, colle le contenu du fichier du même nom, puis **Commit changes**.
4. Onglet **Actions** : la compilation dure 5 à 10 minutes. Quand la pastille est verte, ouvre l’exécution et télécharge **Jeux-de-Papa-apk** dans **Artifacts**.
5. Désinstalle l’ancienne version du jeu sur la tablette, puis installe `Jeux-de-Papa.apk`.

## Organisation

- `www/index.html`, `www/css/style.css` : la page et le style.
- `www/js/game.js` : menus, objets cachés, victoire, publicités.
- `www/js/minis.js`, `www/js/minis2.js`, `www/js/linkedin.js` : les mini-jeux (dont Zip, Queens, Tango et Patches), l’alternance des 100 niveaux et le Sac de papa.
- `www/js/extras.js` : réactions de Papa, pubs interactives, succès, bêtisiers et défi du jour.
- `www/js/scenes.js`, `scenes-plus.js`, `objects.js` : décors et objets des scènes cachées.
- `www/js/audio.js` : musiques et bruitages.
- `www/img/` : Papa et les photos de la maison.
- `assets/` : icône et écran de démarrage.
- `android-overrides/MainActivity.java` : plein écran sans barres.

## Astuce

Dans les Réglages, toucher 5 fois le titre « Réglages » fait apparaître le bouton secret de réinitialisation totale.
