"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Session {
  id: string;
  type: "bike" | "weight_training" | "walking";
  duration: number;
  date: string;
}

interface SessionListProps {
  sessions: Session[];
  onDeleteSession: (id: string) => void;
}

const SessionList: React.FC<SessionListProps> = ({ sessions, onDeleteSession }) => {
  const handleDeleteClick = (id: string) => {
    onDeleteSession(id);
    toast.success("Séance supprimée avec succès !");
  };

  const typeLabels = {
    bike: "Vélo",
    weight_training: "Musculation",
    walking: "Marche"
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Mes Séances</CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-center text-gray-500">Aucune séance enregistrée pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Durée</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="whitespace-nowrap">{format(new Date(session.date), "dd MMM yyyy", { locale: fr })}</TableCell>
                    <TableCell>{typeLabels[session.type]}</TableCell>
                    <TableCell className="text-right">{session.duration} min</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(session.id)}
                        aria-label="Supprimer la séance"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionList;