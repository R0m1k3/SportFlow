"use client";

import React, { useState, useEffect } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import SessionForm from "@/components/SessionForm";
import SessionList from "@/components/SessionList";
import MonthlyStatsCard from "@/components/MonthlyStatsCard";
import { v4 as uuidv4 } from 'uuid';
import { Toaster } from "sonner";

interface Session {
  id: string;
  type: "bike" | "weight_training" | "walking";
  duration: number;
  date: string;
}

const Index = () => {
  const [sessions, setSessions] = useState<Session[]>(() => {
    if (typeof window !== 'undefined') {
      const savedSessions = localStorage.getItem("sportSessions");
      return savedSessions ? JSON.parse(savedSessions) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("sportSessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  const addSession = (newSession: { type: "bike" | "weight_training" | "walking"; duration: number; date: string }) => {
    const sessionWithIdAndDate: Session = {
      ...newSession,
      id: uuidv4(),
      date: newSession.date,
    };
    setSessions((prevSessions) => [...prevSessions, sessionWithIdAndDate]);
  };

  const deleteSession = (id: string) => {
    setSessions((prevSessions) => prevSessions.filter(session => session.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
        Mon Carnet de Séances Sportives
      </h1>
      <SessionForm onAddSession={addSession} />
      <MonthlyStatsCard sessions={sessions} />
      <SessionList sessions={sessions} onDeleteSession={deleteSession} />
      <MadeWithDyad />
      <Toaster richColors position="bottom-right" />
    </div>
  );
};

export default Index;