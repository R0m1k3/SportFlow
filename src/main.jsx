import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, BarChart3, Check, Dumbbell, HeartPulse, Home, Pause, Play, RotateCcw, Settings, SkipForward, Volume2 } from 'lucide-react';
import './styles.css';

const tabs = [
  ['home', 'Accueil', Home],
  ['session', 'Séance', Activity],
  ['exercises', 'Exercices', Dumbbell],
  ['history', 'Historique', HeartPulse],
  ['settings', 'Paramètres', Settings]
];

const api = {
  get: (url) => fetch(url).then((res) => res.json()),
  post: (url, body = {}) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((res) => res.json())
};

function App() {
  const [tab, setTab] = useState('home');
  const [today, setToday] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);

  async function refresh() {
    const [todayData, exerciseData, historyData, statsData, settingsData] = await Promise.all([
      api.get('/api/today'),
      api.get('/api/exercises'),
      api.get('/api/history'),
      api.get('/api/stats'),
      api.get('/api/settings')
    ]);
    setToday(todayData);
    setExercises(exerciseData);
    setHistory(historyData);
    setStats(statsData);
    setSettings(settingsData);
  }

  useEffect(() => {
    refresh();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  }, []);

  if (!today) return <main className="loading">SportFlow se prépare...</main>;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <strong>SportFlow</strong>
          <span>Reprise douce à la maison</span>
        </div>
        <div className="level">Niveau {levelName(stats?.totals?.completedSessions || 0)}</div>
      </header>

      <main className="screen">
        <HealthNotice />
        {tab === 'home' && <HomePage today={today} goSession={() => setTab('session')} />}
        {tab === 'session' && <SessionPage today={today} onRefresh={refresh} />}
        {tab === 'exercises' && <ExercisesPage exercises={exercises} />}
        {tab === 'history' && <HistoryPage history={history} stats={stats} />}
        {tab === 'settings' && <SettingsPage data={settings} onSaved={refresh} />}
      </main>

      <nav className="bottom-nav" aria-label="Navigation principale">
        {tabs.map(([id, label, Icon]) => (
          <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)} aria-label={label}>
            <Icon size={22} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function HealthNotice() {
  return (
    <aside className="notice">
      Cette application ne remplace pas un avis médical. En cas de douleur importante, essoufflement anormal, malaise ou aggravation d’une blessure, arrêtez l’exercice et consultez un professionnel de santé.
    </aside>
  );
}

function HomePage({ today, goSession }) {
  return (
    <section className="stack">
      <div className="hero">
        <div>
          <p className="eyebrow">Séance du jour</p>
          <h1>{today.workout.exercises.length ? 'Prêt pour une séance courte' : 'Repos ou mobilité douce'}</h1>
          <p>{today.workout.planned_duration} min estimées · {today.weekly.completedSessions} séance(s) terminée(s) cette semaine</p>
        </div>
        <button className="primary big" onClick={goSession}><Play size={22} /> Commencer</button>
      </div>
      <div className="metric-grid">
        <Metric label="Niveau actuel" value={levelName(today.weekly.completedSessions)} />
        <Metric label="Cette semaine" value={`${today.weekly.activeMinutes} min`} />
        <Metric label="Exercices" value={today.workout.exercises.length} />
      </div>
      <ExercisePreviewList exercises={today.workout.exercises.slice(0, 4)} />
    </section>
  );
}

function SessionPage({ today, onRefresh }) {
  const workout = today.workout;
  const startIndex = Math.max(0, workout.exercises.findIndex((item) => !item.completed && !item.skipped));
  const [index, setIndex] = useState(startIndex === -1 ? 0 : startIndex);
  const [phase, setPhase] = useState('ready');
  const [series, setSeries] = useState(1);
  const [remaining, setRemaining] = useState(0);
  const [paused, setPaused] = useState(false);
  const exercise = workout.exercises[index];
  const next = workout.exercises[index + 1];

  useEffect(() => {
    if (!exercise) return;
    setRemaining(exercise.planned_duration_seconds || Math.max(20, (exercise.planned_repetitions || 8) * 4));
    setPhase('ready');
    setSeries(1);
    setPaused(false);
  }, [exercise?.id]);

  useEffect(() => {
    if (phase === 'ready' || paused || !exercise) return undefined;
    if (remaining <= 0) {
      beep(today.settings.timerSound);
      if (phase === 'work' && series < exercise.planned_sets) {
        setPhase('rest');
        setRemaining(exercise.rest_seconds || today.settings.defaultRestSeconds || 30);
      } else if (phase === 'rest') {
        setSeries((value) => value + 1);
        setPhase('work');
        setRemaining(exercise.planned_duration_seconds || Math.max(20, (exercise.planned_repetitions || 8) * 4));
      }
      return undefined;
    }
    const timer = window.setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, paused, remaining, series, exercise, today.settings]);

  async function start() {
    await api.post(`/api/workout/${workout.id}/start`);
    setPhase('work');
  }

  async function feedback(feedbackType, painLocation = null) {
    await api.post(`/api/exercise/${exercise.exercise_id}/feedback`, { workoutId: workout.id, feedbackType, painLocation });
    if (index >= workout.exercises.length - 1) await api.post(`/api/workout/${workout.id}/complete`);
    await onRefresh();
    setIndex((value) => Math.min(value + 1, workout.exercises.length - 1));
  }

  if (!exercise) {
    return <section className="empty">Aucun exercice prévu aujourd’hui. Mobilité douce ou repos actif.</section>;
  }

  const isLastSeconds = phase !== 'ready' && remaining <= 5;

  return (
    <section className="session">
      <img className="exercise-image" src={`/exercises/${exercise.image_path}`} alt={exercise.name} />
      <div className="session-title">
        <p className="eyebrow">{phase === 'rest' ? 'Pause' : 'Exercice en cours'}</p>
        <h1>{exercise.name}</h1>
        <p>{exercise.instructions}</p>
      </div>
      <div className={`timer ${isLastSeconds ? 'urgent' : ''}`}>{formatTime(remaining)}</div>
      <div className="session-status">
        <span>Série {series}/{exercise.planned_sets}</span>
        <span>{exercise.planned_duration_seconds ? `${exercise.planned_duration_seconds}s effort` : `${exercise.planned_repetitions} rép.`}</span>
        <span>{exercise.rest_seconds}s pause</span>
      </div>
      <div className="next-box">Suivant : {next ? next.name : 'fin de séance'}</div>
      <p className="precaution">{exercise.precautions}</p>
      {phase === 'ready' ? (
        <button className="primary big sticky-action" onClick={start}><Play /> Démarrer</button>
      ) : (
        <div className="action-grid sticky-action">
          <button onClick={() => setPaused(true)} disabled={paused}><Pause /> Pause</button>
          <button onClick={() => setPaused(false)} disabled={!paused}><Play /> Reprendre</button>
          <button onClick={() => feedback('completed')}><Check /> Terminé</button>
          <button onClick={() => feedback('skipped')}><SkipForward /> Passer</button>
          <button onClick={() => feedback('too_easy')}>Trop facile</button>
          <button onClick={() => feedback('too_hard')}>Trop difficile</button>
          <button className="danger" onClick={() => feedback('pain', exercise.body_area === 'pieds' ? 'pieds' : 'épaule')}>Douleur</button>
        </div>
      )}
    </section>
  );
}

function ExercisesPage({ exercises }) {
  const groups = groupBy(exercises, 'category');
  return (
    <section className="stack">
      <h1>Exercices</h1>
      {Object.entries(groups).map(([category, items]) => (
        <div key={category}>
          <h2>{labelCategory(category)}</h2>
          <div className="card-list">
            {items.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} />)}
          </div>
        </div>
      ))}
    </section>
  );
}

function HistoryPage({ history, stats }) {
  return (
    <section className="stack">
      <h1>Historique et statistiques</h1>
      <div className="metric-grid">
        <Metric label="Séances terminées" value={stats?.totals?.completedSessions || 0} />
        <Metric label="Minutes actives" value={stats?.totals?.activeMinutes || 0} />
        <Metric label="Semaines suivies" value={stats?.weekly?.length || 0} />
      </div>
      <SimpleChart rows={stats?.weekly || []} />
      <div className="card-list">
        {history.map((workout) => (
          <article className="card" key={workout.id}>
            <div className="card-head">
              <strong>{new Date(workout.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
              <span>{workout.completed ? 'terminée' : 'prévue'}</span>
            </div>
            <p>{workout.planned_duration} min · {workout.exercises.length} exercice(s)</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SettingsPage({ data, onSaved }) {
  const [user, setUser] = useState(data.user);
  const [settings, setSettings] = useState(data.settings);

  async function save() {
    await api.post('/api/settings', { user, settings });
    await onSaved();
  }

  return (
    <section className="stack">
      <h1>Paramètres</h1>
      <div className="form-card">
        <label>Prénom<input value={user.first_name || ''} onChange={(e) => setUser({ ...user, first_name: e.target.value })} /></label>
        <label>Âge<input type="number" value={user.age || ''} onChange={(e) => setUser({ ...user, age: Number(e.target.value) })} /></label>
        <label>Poids de départ<input type="number" value={user.start_weight || ''} onChange={(e) => setUser({ ...user, start_weight: Number(e.target.value) })} /></label>
        <label>Poids actuel<input type="number" value={user.current_weight || ''} onChange={(e) => setUser({ ...user, current_weight: Number(e.target.value) })} /></label>
        <label>Objectif de poids<input type="number" value={user.target_weight || ''} onChange={(e) => setUser({ ...user, target_weight: Number(e.target.value) })} /></label>
        <label>Pause par défaut<input type="number" value={settings.defaultRestSeconds || 30} onChange={(e) => setSettings({ ...settings, defaultRestSeconds: Number(e.target.value) })} /></label>
        <label className="toggle"><input type="checkbox" checked={settings.timerSound} onChange={(e) => setSettings({ ...settings, timerSound: e.target.checked })} /> <Volume2 size={18} /> Son du chronomètre</label>
        <button className="primary big" onClick={save}><Check /> Enregistrer</button>
      </div>
    </section>
  );
}

function ExercisePreviewList({ exercises }) {
  return <div className="card-list">{exercises.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} compact />)}</div>;
}

function ExerciseCard({ exercise, compact = false }) {
  return (
    <article className="card exercise-card">
      <img src={`/exercises/${exercise.image_path}`} alt="" />
      <div>
        <div className="card-head"><strong>{exercise.name}</strong><span>{labelCategory(exercise.category)}</span></div>
        {!compact && <p>{exercise.instructions}</p>}
        <p className="muted">{exercise.planned_duration_seconds || exercise.current_duration_seconds ? `${exercise.planned_duration_seconds || exercise.current_duration_seconds}s` : `${exercise.planned_repetitions || exercise.current_repetitions} répétitions`} · {exercise.planned_sets || exercise.current_sets || exercise.default_sets} série(s)</p>
      </div>
    </article>
  );
}

function Metric({ label, value }) {
  return <article className="metric"><span>{label}</span><strong>{value}</strong></article>;
}

function SimpleChart({ rows }) {
  const max = Math.max(1, ...rows.map((row) => row.minutes || 0));
  return (
    <div className="chart">
      {rows.map((row) => <div key={row.week} style={{ height: `${Math.max(10, (row.minutes / max) * 100)}%` }} title={`${row.minutes} minutes`} />)}
    </div>
  );
}

function groupBy(items, key) {
  return items.reduce((acc, item) => {
    acc[item[key]] ||= [];
    acc[item[key]].push(item);
    return acc;
  }, {});
}

function formatTime(value) {
  const minutes = Math.floor(value / 60).toString().padStart(2, '0');
  const seconds = Math.max(0, value % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function labelCategory(category) {
  return {
    echauffement: 'Échauffement',
    gainage: 'Gainage',
    abdos: 'Abdos doux',
    cardio: 'Cardio doux',
    'haut du corps': 'Haut du corps'
  }[category] || category;
}

function levelName(completedSessions) {
  if (completedSessions >= 30) return '4 · Entretien';
  if (completedSessions >= 20) return '3 · Progression';
  if (completedSessions >= 10) return '2 · Stabilisation';
  return '1 · Reprise';
}

function beep(enabled) {
  if (!enabled) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 660;
  gain.gain.value = 0.05;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  window.setTimeout(() => {
    osc.stop();
    ctx.close();
  }, 140);
}

createRoot(document.getElementById('root')).render(<App />);
