import { db, nowIso, setSetting } from './db.js';

const exercises = [
  ['Marche sur place', 'echauffement', 'pieds', 'Échauffement lent et respiré.', 'Marcher lentement sur place, respiration calme, épaules relâchées.', 'Ne pas accélérer trop fort.', 'marche-sur-place.png', 120, null, 1, 30, '', 1, 0, 'Lever moins les genoux.', 'Allonger doucement la durée.', 'Augmenter par paliers de 30 secondes.'],
  ['Cercles d’épaules', 'echauffement', 'epaule', 'Mobilité douce des épaules.', 'Faire de petits cercles avec les épaules, lentement.', 'Ne pas lever les bras au-dessus des épaules.', 'cercles-epaules.png', 30, null, 1, 20, '', 1, 1, 'Cercles très petits.', 'Tenir la posture plus longtemps.', 'Augmenter seulement la durée.'],
  ['Cercles de chevilles', 'echauffement', 'pieds', 'Mobilité douce des chevilles.', 'Faire des cercles avec chaque cheville.', 'Garder un appui stable.', 'cercles-chevilles.png', 30, null, 1, 20, '', 1, 1, 'Faire assis.', 'Ajouter quelques secondes.', 'Augmenter par paliers courts.'],
  ['Gainage contre un mur', 'gainage', 'tronc', 'Gainage très progressif.', 'Mains contre un mur, pieds reculés, corps droit, ventre contracté.', 'Arrêter si douleur à l’épaule.', 'gainage-mur.png', 20, null, 3, 30, 'mur', 1, 1, 'Rapprocher les pieds du mur.', 'Passer à 25 puis 30 secondes, puis table solide.', 'Ajouter 5 secondes quand tout va bien.'],
  ['Gainage latéral simplifié', 'gainage', 'epaule', 'Gainage latéral doux.', 'Allongé sur le côté, genoux pliés, appui sur l’avant-bras, soulever légèrement le bassin.', 'Supprimer automatiquement si douleur à l’épaule.', 'gainage-lateral-simple.png', 10, null, 2, 30, 'tapis', 0, 1, 'Rester allongé et contracter les abdos.', 'Tenir quelques secondes de plus.', 'Augmenter uniquement sans douleur.'],
  ['Respiration abdominale', 'abdos', 'tronc', 'Activation profonde des abdos.', 'Allongé sur le dos, genoux pliés, inspirer puis expirer en rentrant doucement le ventre.', 'Ne pas bloquer la respiration.', 'respiration-abdominale.png', null, 10, 2, 30, 'tapis', 1, 1, 'Faire assis.', 'Tenir l’expiration plus longtemps.', 'Ajouter 2 répétitions.'],
  ['Talon glissé', 'abdos', 'tronc', 'Contrôle doux du bassin.', 'Allongé sur le dos, genoux pliés, faire glisser un talon vers l’avant puis revenir.', 'Garder le bas du dos stable.', 'talon-glisse.png', null, 10, 2, 30, 'tapis', 1, 1, 'Réduire l’amplitude.', 'Allonger légèrement le mouvement.', 'Ajouter 2 répétitions par jambe.'],
  ['Genou levé alterné', 'abdos', 'tronc', 'Abdos sans crunch violent.', 'Allongé sur le dos, contracter doucement le ventre, lever un genou puis reposer.', 'Mouvement lent, sans tirer sur le dos.', 'genou-leve-alterne.png', null, 10, 2, 30, 'tapis', 1, 1, 'Lever moins haut.', 'Ralentir la descente.', 'Ajouter 2 répétitions par jambe.'],
  ['Vélo d’appartement', 'cardio', 'cardio', 'Cardio doux sans impact.', 'Pédaler à intensité facile à modérée.', 'Pouvoir parler pendant l’effort.', 'velo-appartement.png', 1200, null, 1, 0, 'vélo d’appartement', 1, 1, 'Réduire la durée.', 'Ajouter 5 minutes maximum.', 'Augmenter de 5 minutes au maximum.'],
  ['Marche douce', 'cardio', 'pieds', 'Cardio doux sur terrain plat.', 'Marcher sur terrain plat.', 'Bonnes chaussures, arrêt si douleur aux pieds.', 'marche-douce.png', 1200, null, 1, 0, 'aucun', 1, 0, 'Raccourcir la marche.', 'Ajouter 5 minutes maximum.', 'Réduire si douleur aux pieds.'],
  ['Tirage élastique coude au corps', 'haut du corps', 'epaule', 'Renforcement du dos très contrôlé.', 'Fixer l’élastique devant soi, tirer les coudes vers l’arrière en gardant les bras près du corps.', 'Épaules basses, pas de douleur, ne pas tirer fort.', 'tirage-elastique-coude-corps.png', null, 10, 2, 45, 'élastique léger', 0, 1, 'Sans élastique, serrer les omoplates.', 'Passer à 12 puis 15 répétitions.', 'Augmenter répétitions puis séries, jamais la résistance au début.'],
  ['Rotation externe avec élastique léger', 'haut du corps', 'epaule', 'Épaule prudente et légère.', 'Coude collé au corps, avant-bras plié à 90°, tourner doucement la main vers l’extérieur.', 'Très léger, amplitude courte, arrêt immédiat si douleur.', 'rotation-externe-elastique.png', null, 8, 2, 45, 'élastique léger', 0, 1, 'Sans élastique, amplitude courte.', 'Ajouter 2 répétitions sans résistance forte.', 'Augmenter les répétitions, jamais la résistance au début.'],
  ['Serrage des omoplates', 'haut du corps', 'epaule', 'Posture et haut du dos.', 'Assis ou debout, rapprocher doucement les omoplates, tenir 2 secondes, relâcher.', 'Ne pas hausser les épaules.', 'serrage-omoplates.png', null, 10, 2, 30, 'aucun', 1, 1, 'Amplitude très légère.', 'Tenir 3 secondes.', 'Passer à 15 répétitions, puis tenir 3 secondes.'],
  ['Curl biceps léger', 'haut du corps', 'bras', 'Bras avec charge très légère.', 'Coudes près du corps, plier les bras lentement puis redescendre.', 'Pas d’élan, pas de charge lourde.', 'curl-biceps-leger.png', null, 10, 2, 45, 'bouteilles d’eau', 1, 1, 'Sans charge.', 'Passer à 12 puis 15 répétitions.', 'Augmenter les répétitions avant la charge.'],
  ['Extension triceps assis avec élastique bas', 'haut du corps', 'bras', 'Triceps sans lever le bras.', 'Tendre doucement l’avant-bras vers le bas ou l’arrière sans lever le coude haut.', 'Garder le coude près du corps, éviter tout mouvement au-dessus de l’épaule.', 'extension-triceps-elastique-bas.png', null, 8, 2, 45, 'élastique léger', 1, 1, 'Faire sans élastique.', 'Passer à 10 puis 12 répétitions.', 'Augmenter les répétitions seulement.'],
  ['Pompes contre le mur', 'haut du corps', 'epaule', 'Poussée très douce au mur.', 'Mains contre le mur à hauteur de poitrine, plier légèrement les bras, repousser doucement.', 'Mouvement court, arrêter si douleur à l’épaule.', 'pompes-mur.png', null, 8, 2, 45, 'mur', 0, 1, 'Rester plus près du mur.', 'Passer à 10 puis 12 répétitions, puis table solide.', 'Augmenter les répétitions avant toute variante.'],
  ['Rowing avec bouteille très légère', 'haut du corps', 'bras', 'Tirage léger unilatéral.', 'Buste légèrement incliné, dos droit, tirer le coude vers l’arrière sans monter l’épaule.', 'Charge très légère, mouvement lent.', 'rowing-bouteille-leger.png', null, 8, 2, 45, 'bouteille d’eau légère', 1, 1, 'Sans charge.', 'Ajouter 2 répétitions.', 'Augmenter les répétitions avant la charge.']
];

export function seed() {
  db.prepare(`
    INSERT OR IGNORE INTO users (id, first_name, age, created_at)
    VALUES (1, 'Michael', 53, ?)
  `).run(nowIso());

  const count = db.prepare('SELECT COUNT(*) AS count FROM exercises').get().count;
  if (count === 0) {
    const insert = db.prepare(`
      INSERT INTO exercises (
        name, category, body_area, description, instructions, precautions, image_path,
        base_duration_seconds, base_repetitions, default_sets, default_rest_seconds,
        equipment, shoulder_safe, foot_safe, easy_variant, hard_variant, progression_rule
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    db.exec('BEGIN');
    try {
      for (const exercise of exercises) insert.run(...exercise);
      for (const row of db.prepare('SELECT * FROM exercises').all()) {
        db.prepare(`
          INSERT INTO progression (exercise_id, current_duration_seconds, current_repetitions, current_sets, current_level, last_updated)
          VALUES (?, ?, ?, ?, 1, ?)
        `).run(row.id, row.base_duration_seconds, row.base_repetitions, row.default_sets, nowIso());
      }
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }

  const defaults = {
    defaultRestSeconds: 30,
    preparationSeconds: 8,
    timerSound: true,
    preferredDays: ['lundi', 'mercredi', 'jeudi', 'vendredi', 'dimanche'],
    equipment: ['vélo d’appartement', 'tapis', 'élastique', 'chaise', 'bouteilles d’eau'],
    knownPain: ['épaule', 'pieds'],
    theme: 'sobre'
  };
  for (const [key, value] of Object.entries(defaults)) {
    db.prepare('INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)').run(key, JSON.stringify(value), nowIso());
  }
}
