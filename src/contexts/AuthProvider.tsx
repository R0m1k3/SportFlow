import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { users as dbUsers } from "@/lib/auth-data";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  role: string;
}

interface Session {
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = (email: string, password: string) => {
    setLoading(true);
    setTimeout(() => { // Simuler une latence réseau
      const foundUser = dbUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (foundUser) {
        const { password, ...userToStore } = foundUser;
        setUser(userToStore);
        toast.success("Connexion réussie !");
      } else {
        toast.error("Email ou mot de passe incorrect.");
      }
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