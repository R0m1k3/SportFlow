"use client";

import React, { useState, useEffect } from "react";
import SessionForm from "@/components/SessionForm";
import SessionList from "@/components/SessionList";
import MonthlyStatsCard from "@/components/MonthlyStatsCard";
import Logo from "@/components/Logo";
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
      const parsedSessions = savedSessions ? JSON.parse(savedSessions) : [];
      return parsedSessions.sort((a: Session, b: Session) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
    setSessions((prevSessions) => [...prevSessions, sessionWithIdAndDate].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteSession = (id: string) => {
    setSessions((prevSessions) => prevSessions.filter(session => session.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <Logo />
        </div>
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col gap-8">
            <SessionForm onAddSession={addSession} />
            <MonthlyStatsCard sessions={sessions} />
          </div>
          <div className="lg:col-span-2">
            <SessionList sessions={sessions} onDeleteSession={deleteSession} />
          </div>
        </main>
      </div>
      <Toaster richColors position="bottom-right" />
    </div>
  );
};

export default Index;