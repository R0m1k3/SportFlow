import { createContext, useContext, useState, ReactNode, useMemo } from "react";

// Types factices pour remplacer les dépendances Supabase
interface User {
  id: string;
  email: string;
}

interface Session {
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = (email: string) => {
    setLoading(true);
    setTimeout(() => { // Simuler une connexion asynchrone
      const mockUser: User = { id: 'mock-user-id', email };
      setUser(mockUser);
      setLoading(false);
    }, 500);
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    session: user ? { user } : null,
    loading,
    login,
    logout,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};