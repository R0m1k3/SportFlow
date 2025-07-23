import { v4 as uuidv4 } from 'uuid';

export interface Session {
  id: string;
  user_id: string;
  type: "bike" | "weight_training" | "walking";
  duration: number;
  date: string;
  created_at?: string;
}

// Données de simulation
let sessions: Session[] = [
  {
    id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    user_id: 'mock-user-id',
    type: 'bike',
    duration: 45,
    date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
    user_id: 'mock-user-id',
    type: 'weight_training',
    duration: 60,
    date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
];

// Simuler la latence du réseau
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const fetchSessions = async (userId: string | undefined): Promise<Session[]> => {
  if (!userId) return [];
  await delay(300);
  return [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addSession = async (session: Omit<Session, 'id' | 'created_at'>): Promise<Session> => {
  await delay(300);
  const newSession: Session = {
    ...session,
    id: uuidv4(),
    created_at: new Date().toISOString(),
  };
  sessions.push(newSession);
  return newSession;
};

export const deleteSession = async (id: string): Promise<{ id: string }> => {
  await delay(300);
  sessions = sessions.filter(s => s.id !== id);
  return { id };
};