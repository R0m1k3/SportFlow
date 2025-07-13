"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActivityType } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { addActivity } from "@/lib/db";

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  date: Date | undefined;
  userEmail: string;
}

const activityOptions: ActivityType[] = ["vélo", "musculation", "fitness", "basket"];

export function ActivityModal({ isOpen, onClose, onSave, date, userEmail }: ActivityModalProps) {
  const [activityType, setActivityType] = useState<ActivityType | undefined>();
  const [duration, setDuration] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setActivityType(undefined);
      setDuration("");
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!activityType || !duration || !date || parseInt(duration, 10) <= 0) {
      toast.error("Veuillez remplir tous les champs avec des valeurs valides.");
      return;
    }
    try {
      await addActivity({
        userEmail,
        date: format(date, "yyyy-MM-dd"),
        type: activityType,
        duration: parseInt(duration, 10),
      });
      toast.success("Activité enregistrée !");
      onSave();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement de l'activité.");
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter une activité</DialogTitle>
          {date && (
            <DialogDescription>
              Pour le {format(date, "d MMMM yyyy", { locale: fr })}.
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="activity-type" className="text-right">
              Activité
            </Label>
            <Select onValueChange={(value: ActivityType) => setActivityType(value)}>
              <SelectTrigger className="col-span-3" id="activity-type">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {activityOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">
              Durée (min)
            </Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="col-span-3"
              placeholder="Ex: 60"
              min="1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}