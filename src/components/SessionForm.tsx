"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Bike, Dumbbell, Footprints } from "lucide-react";

interface SessionFormProps {
  onAddSession: (session: { type: "bike" | "weight_training" | "walking"; duration: number; date: string }) => void;
}

const SessionForm: React.FC<SessionFormProps> = ({ onAddSession }) => {
  const [sessionType, setSessionType] = useState<"bike" | "weight_training" | "walking">("bike");
  const [duration, setDuration] = useState<string>("30");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedDuration = parseInt(duration, 10);

    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      toast.error("Veuillez entrer une durée valide (nombre positif).");
      return;
    }

    if (!selectedDate) {
      toast.error("Veuillez sélectionner une date pour la séance.");
      return;
    }

    onAddSession({ 
      type: sessionType, 
      duration: parsedDuration, 
      date: format(selectedDate, "yyyy-MM-dd")
    });
    setDuration("30");
    setSelectedDate(new Date());
    toast.success("Séance ajoutée avec succès !");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Ajouter une séance</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Type de séance</Label>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <Button
                type="button"
                variant={sessionType === 'bike' ? 'secondary' : 'outline'}
                onClick={() => setSessionType('bike')}
                className="flex flex-col h-16 sm:h-20 sm:flex-row sm:gap-2"
              >
                <Bike className="h-6 w-6 mb-1 sm:mb-0" />
                <span className="text-xs sm:text-sm">Vélo</span>
              </Button>
              <Button
                type="button"
                variant={sessionType === 'weight_training' ? 'secondary' : 'outline'}
                onClick={() => setSessionType('weight_training')}
                className="flex flex-col h-16 sm:h-20 sm:flex-row sm:gap-2"
              >
                <Dumbbell className="h-6 w-6 mb-1 sm:mb-0" />
                <span className="text-xs sm:text-sm">Muscu</span>
              </Button>
              <Button
                type="button"
                variant={sessionType === 'walking' ? 'secondary' : 'outline'}
                onClick={() => setSessionType('walking')}
                className="flex flex-col h-16 sm:h-20 sm:flex-row sm:gap-2"
              >
                <Footprints className="h-6 w-6 mb-1 sm:mb-0" />
                <span className="text-xs sm:text-sm">Marche</span>
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Durée (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Ex: 30"
              min="1"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Date de la séance</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button type="submit" className="w-full">
            Ajouter la séance
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SessionForm;