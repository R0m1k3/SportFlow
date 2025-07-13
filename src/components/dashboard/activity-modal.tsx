"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Activity, ActivityType } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { addActivity } from "@/lib/db";

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newActivity: Activity) => void;
  date: Date | undefined;
  userEmail: string;
}

const activityOptions: [ActivityType, ...ActivityType[]] = ["vélo", "musculation", "fitness", "basket"];

const formSchema = z.object({
  activityType: z.enum(activityOptions, { required_error: "Veuillez sélectionner une activité." }),
  duration: z.coerce.number({ invalid_type_error: "Veuillez entrer un nombre." }).int().positive("La durée doit être un nombre positif."),
});

export function ActivityModal({ isOpen, onClose, onSave, date, userEmail }: ActivityModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const handleSave = async (values: z.infer<typeof formSchema>) => {
    if (!date) {
      toast.error("Aucune date sélectionnée.");
      return;
    }

    const newActivityData: Omit<Activity, "id"> = {
      userEmail,
      date: format(date, "yyyy-MM-dd"),
      type: values.activityType,
      duration: values.duration,
    };

    try {
      const newId = await addActivity(newActivityData);
      toast.success("Activité enregistrée !");
      onSave({ ...newActivityData, id: newId as number });
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement de l'activité.");
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)}>
            <DialogHeader>
              <DialogTitle>Ajouter une activité</DialogTitle>
              {date && (
                <DialogDescription>
                  Pour le {format(date, "d MMMM yyyy", { locale: fr })}.
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="activityType"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Activité</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="col-span-3" id="activity-type">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activityOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="col-span-4 text-right" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel htmlFor="duration" className="text-right">Durée (min)</FormLabel>
                    <FormControl>
                      <Input
                        id="duration"
                        type="number"
                        placeholder="Ex: 60"
                        min="1"
                        {...field}
                        className="col-span-3"
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 text-right" />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>Enregistrer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}