"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isSameMonth, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface Session {
  id: string;
  type: "bike" | "weight_training";
  duration: number; // in minutes
  date: string; // YYYY-MM-DD
}

interface MonthlyStatsCardProps {
  sessions: Session[];
}

const MonthlyStatsCard: React.FC<MonthlyStatsCardProps> = ({ sessions }) => {
  const currentMonth = new Date();

  const monthlySessions = sessions.filter(session =>
    isSameMonth(parseISO(session.date), currentMonth)
  );

  const totalSessions = monthlySessions.length;
  const totalDuration = monthlySessions.reduce((sum, session) => sum + session.duration, 0);

  const bikeSessions = monthlySessions.filter(session => session.type === "bike").length;
  const weightTrainingSessions = monthlySessions.filter(session => session.type === "weight_training").length;

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Statistiques de {format(currentMonth, "MMMM yyyy", { locale: fr })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium">Séances totales :</span>
          <Badge variant="secondary" className="text-lg px-3 py-1">{totalSessions}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium">Durée totale :</span>
          <Badge variant="secondary" className="text-lg px-3 py-1">{totalDuration} min</Badge>
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium">Répartition par type :</p>
          <div className="flex justify-between items-center pl-4">
            <span>Vélo d'appartement :</span>
            <Badge variant="outline">{bikeSessions}</Badge>
          </div>
          <div className="flex justify-between items-center pl-4">
            <span>Musculation :</span>
            <Badge variant="outline">{weightTrainingSessions}</Badge>
          </div>
        </div>
        {totalSessions === 0 && (
          <p className="text-center text-gray-500 text-sm mt-4">Aucune séance enregistrée ce mois-ci.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyStatsCard;