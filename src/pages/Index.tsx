"use client";

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SessionForm from "@/components/SessionForm";
import SessionList from "@/components/SessionList";
import MonthlyStatsCard from "@/components/MonthlyStatsCard";
import Logo from "@/components/Logo";
import { Toaster, toast } from "sonner";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchSessions, addSession as addSessionApi, deleteSession as deleteSessionApi } from "@/lib/data";

interface Session {
  id: string;
  type: "bike" | "weight_training" | "walking";
  duration: number;
  date: string;
}

const Index = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions", user?.id],
    queryFn: () => fetchSessions(user?.id),
    enabled: !!user,
  });

  const addSession = async (newSession: { type: "bike" | "weight_training" | "walking"; duration: number; date: string }) => {
    if (!user) return;
    try {
      await addSessionApi({ ...newSession, user_id: user.id });
      toast.success("Séance ajoutée avec succès !");
      queryClient.invalidateQueries({ queryKey: ["sessions", user.id] });
    } catch (error) {
      toast.error("Erreur lors de l'ajout de la séance.");
      console.error("Error adding session:", error);
    }
  };

  const deleteSession = async (id: string) => {
    if (!user) return;
    try {
      await deleteSessionApi(id);
      toast.success("Séance supprimée avec succès !");
      queryClient.invalidateQueries({ queryKey: ["sessions", user?.id] });
    } catch (error) {
      toast.error("Erreur lors de la suppression de la séance.");
      console.error("Error deleting session:", error);
    }
  };

  const handleLogout = () => {
    logout();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center p-6 bg-card border rounded-lg shadow-md">
          <Logo />
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col gap-8">
            <SessionForm onAddSession={addSession} />
            {isLoading ? <Skeleton className="h-[280px] w-full" /> : <MonthlyStatsCard sessions={sessions as Session[]} />}
          </div>
          <div className="lg:col-span-2">
            {isLoading ? <Skeleton className="h-[400px] w-full" /> : <SessionList sessions={sessions as Session[]} onDeleteSession={deleteSession} />}
          </div>
        </main>
      </div>
      <Toaster richColors position="bottom-right" />
    </div>
  );
};

export default Index;