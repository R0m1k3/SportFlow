"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface SessionFormProps {
  onAddSession: (session: { type: "bike" | "weight_training"; duration: number }) => void;
}

const SessionForm: React.FC<SessionFormProps> = ({ onAddSession }) => {
  const [sessionType, setSessionType] = useState<"bike" | "weight_training">("bike");
  const [duration, setDuration] = useState<string>("30");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedDuration = parseInt(duration, 10);

    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      toast.error("Veuillez entrer une durée valide (nombre positif).");
      return;
    }

    onAddSession({ type: sessionType, duration: parsedDuration });
    setDuration("30"); // Reset duration to default
    toast.success("Séance ajoutée avec succès !");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Ajouter une séance</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionType">Type de séance</Label>
            <RadioGroup
              defaultValue="bike"
              onValueChange={(value: "bike" | "weight_training") => setSessionType(value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bike" id="bike" />
                <Label htmlFor="bike">Vélo d'appartement</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weight_training" id="weight_training" />
                <Label htmlFor="weight_training">Musculation</Label>
              </div>
            </RadioGroup>
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
          <Button type="submit" className="w-full">
            Ajouter la séance
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SessionForm;