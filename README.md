# SportFlow

SportFlow est une petite application personnelle mobile-first pour suivre des exercices doux à la maison : séance du jour, images explicatives, chronomètre, pauses, feedback, historique, statistiques simples, progression automatique et règles de prudence en cas de douleur.

## Lancement avec Docker

```bash
docker compose up -d
```

Application :

- Ordinateur : http://localhost:3000
- Téléphone : `http://adresse-ip-du-serveur:3000`

Arrêter :

```bash
docker compose down
```

Voir les logs :

```bash
docker compose logs -f
```

## Données persistantes

SQLite est stocké dans le volume Docker `sportflow-data` à l’emplacement `/app/data/sportflow.sqlite`.

Sauvegarder la base :

```bash
docker compose exec sportflow cp /app/data/sportflow.sqlite /app/data/sportflow-backup.sqlite
docker cp sportflow:/app/data/sportflow-backup.sqlite ./sportflow-backup.sqlite
```

Restaurer une sauvegarde :

```bash
docker compose down
docker volume rm sportflow_sportflow-data
docker compose up -d
docker cp ./sportflow-backup.sqlite sportflow:/app/data/sportflow.sqlite
docker compose restart
```

Les images réalistes d’exercices sont incluses dans l’image Docker. Ne montez pas un volume vide sur `/app/public/exercises`, sinon Docker masquera les images incluses.

Pour remplacer volontairement les images, placez vos fichiers dans :

```text
public/exercises
```

Si une image `.png` demandée n’existe pas, le serveur affiche une fiche de secours à la même URL.

## Développement local

Terminal 1 :

```bash
$env:PORT=3001; npm run server
```

Terminal 2 :

```bash
npm run dev
```

Le frontend Vite est accessible sur http://localhost:3000 et proxifie les API vers le backend local sur le port 3001.

## API

- `GET /api/today` : séance du jour, utilisateur, paramètres et résumé hebdomadaire.
- `POST /api/workout/:id/start` : démarre une séance.
- `POST /api/workout/:id/complete` : termine une séance et recalcule la progression.
- `POST /api/exercise/:id/feedback` : enregistre `completed`, `too_easy`, `too_hard`, `pain` ou `skipped`.
- `GET /api/exercises` : bibliothèque d’exercices.
- `GET /api/history` : historique des séances.
- `GET /api/stats` : statistiques et progression.
- `GET /api/settings` : profil et paramètres.
- `POST /api/settings` : mise à jour du profil et des paramètres.
- `GET /api/progression` : progression actuelle.
- `POST /api/progression/recalculate` : recalcul manuel.

## Progression et prudence

L’application applique une progression volontairement prudente :

- deux retours “trop facile” sur un exercice augmentent légèrement la durée ou les répétitions ;
- “trop difficile” réduit la charge de travail d’environ 20 % ;
- “douleur” marque l’exercice comme problématique, réduit la progression et le retire temporairement ;
- une douleur épaule retire les exercices non sûrs, le gainage latéral et les exercices avec élastique pendant 7 jours ;
- une douleur pieds privilégie le vélo plutôt que la marche ;
- trois séances terminées dans la semaine sans douleur augmentent seulement le gainage de 5 secondes.

L’application ne propose pas de course, burpees, pompes classiques, tractions, dips, développé épaules, mouvements bras au-dessus de la tête, crunchs violents, mouvements explosifs ou charges lourdes.

## PWA

SportFlow fournit :

- `public/manifest.json`
- `public/service-worker.js`
- `public/icons/icon.svg`
- affichage `standalone`
- orientation portrait
- thème sobre `#3f6f68`

Depuis un smartphone, ouvrir `http://adresse-ip-du-serveur:3000`, puis utiliser l’option du navigateur “Ajouter à l’écran d’accueil”.

## Arborescence

```text
SportFlow/
├─ Dockerfile
├─ docker-compose.yml
├─ index.html
├─ package.json
├─ vite.config.js
├─ README.md
├─ public/
│  ├─ manifest.json
│  ├─ service-worker.js
│  ├─ icons/
│  │  └─ icon.svg
│  └─ exercises/
│     ├─ marche-sur-place.png
│     ├─ gainage-mur.png
│     └─ ...
├─ server/
│  ├─ db.js
│  ├─ index.js
│  ├─ schema.sql
│  ├─ seed.js
│  └─ workouts.js
└─ src/
   ├─ main.jsx
   └─ styles.css
```

## Notes de santé

Cette application ne remplace pas un avis médical. En cas de douleur importante, essoufflement anormal, malaise ou aggravation d’une blessure, il faut arrêter l’exercice et consulter un professionnel de santé.
