"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getUserByName } from "@/lib/db";
import { LogIn } from "lucide-react";

export function LoginForm() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await getUserByName(username);

    if (user && user.password === password) {
      toast.success("Connexion réussie ! Redirection...");
      localStorage.setItem("loggedInUser", user.email);
      localStorage.setItem("userRole", user.role);
      router.push('/dashboard');
    } else {
      toast.error("Nom d'utilisateur ou mot de passe incorrect.");
    }
  };

  return (
    <div className="w-full max-w-sm p-8 space-y-6 bg-card/80 dark:bg-card/50 backdrop-blur-lg rounded-2xl shadow-xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Connexion</h1>
        <p className="text-muted-foreground">
          Accédez à votre tableau de bord.
        </p>
      </div>
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username">Nom d'utilisateur</Label>
          <Input
            id="username"
            type="text"
            placeholder="admin"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input 
            id="password" 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        <Button className="w-full text-lg py-6 group" type="submit">
          Se connecter
          <LogIn className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </form>
    </div>
  );
}