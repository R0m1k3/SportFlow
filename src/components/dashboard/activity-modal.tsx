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
import { ActivityType } from "./activity-calendar";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: { type: ActivityType; duration: number }) => void;
  date: Date | undefined;
}

const activityOptions: ActivityType[] = ["vélo", "musculation", "fitness", "basket"];

export function ActivityModal({ isOpen, onClose, onSave, date }: ActivityModalProps) {
  const [activityType, setActivityType] = useState<ActivityType | undefined>();
  const [duration, setDuration] = useState("");

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal is closed
      setActivityType(undefined);
      setDuration("");
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!activityType || !duration || parseInt(duration, 10) <= 0) {
      toast.error("Veuillez remplir tous les champs avec des valeurs valides.");
      return;
    }
    onSave({ type: activityType, duration: parseInt(duration, 10) });
    toast.success("Activité enregistrée !");
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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