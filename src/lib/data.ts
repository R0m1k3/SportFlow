const API_URL = import.meta.env.VITE_API_URL;

export interface Session {
  id: string;
  user_id?: string;
  type: "bike" | "weight_training" | "walking";
  duration: number;
  date: string;
  created_at?: string;
}

const getHeaders = (token: string) => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`,
});

export const fetchSessions = async (token: string): Promise<Session[]> => {
  const response = await fetch(`${API_URL}/sessions`, {
    headers: getHeaders(token),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch sessions');
  }
  const data = await response.json();
  return data.map((s: any) => ({ ...s, date: s.date.split('T')[0] }));
};

export const addSession = async (
  session: Omit<Session, 'id' | 'created_at' | 'user_id'>,
  token: string
): Promise<Session> => {
  const response = await fetch(`${API_URL}/sessions`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(session),
  });
  if (!response.ok) {
    throw new Error('Failed to add session');
  }
  return response.json();
};

export const deleteSession = async (id: string, token: string): Promise<{ id: string }> => {
  const response = await fetch(`${API_URL}/sessions/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  if (!response.ok) {
    throw new Error('Failed to delete session');
  }
  return response.json();
};