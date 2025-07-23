"use client";

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SessionForm from "@/components/SessionForm";
import SessionList from "@/components/SessionList";
import MonthlyStatsCard from "@/components/MonthlyStatsCard";
import Logo from "@/components/Logo";
import { Toaster, toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Session {
  id: string;
  type: "bike" | "weight_training" | "walking";
  duration: number;
  date: string;
}

const fetchSessions = async (userId: string | undefined) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("sport_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) {
    toast.error("Erreur lors du chargement des séances.");
    console.error("Error fetching sessions:", error);
    return [];
  }
  return data;
};

const Index = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions", user?.id],
    queryFn: () => fetchSessions(user?.id),
    enabled: !!user,
  });

  const addSession = async (newSession: { type: "bike" | "weight_training" | "walking"; duration: number; date: string }) => {
    if (!user) return;
    const { error } = await supabase
      .from("sport_sessions")
      .insert([{ ...newSession, user_id: user.id }]);

    if (error) {
      toast.error("Erreur lors de l'ajout de la séance.");
    } else {
      toast.success("Séance ajoutée avec succès !");
      queryClient.invalidateQueries({ queryKey: ["sessions", user.id] });
    }
  };

  const deleteSession = async (id: string) => {
    const { error } = await supabase.from("sport_sessions").delete().eq("id", id);
    if (error) {
      toast.error("Erreur lors de la suppression de la séance.");
    } else {
      toast.success("Séance supprimée avec succès !");
      queryClient.invalidateQueries({ queryKey: ["sessions", user.id] });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
            {isLoading ? <Skeleton className="h-[280px] w-full" /> : <MonthlyStatsCard sessions={sessions} />}
          </div>
          <div className="lg:col-span-2">
            {isLoading ? <Skeleton className="h-[400px] w-full" /> : <SessionList sessions={sessions} onDeleteSession={deleteSession} />}
          </div>
        </main>
      </div>
      <Toaster richColors position="bottom-right" />
    </div>
  );
};

export default Index;