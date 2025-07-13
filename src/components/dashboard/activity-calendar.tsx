"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ActivityModal } from "./activity-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export type ActivityType = "vélo" | "musculation" | "fitness" | "basket";
export interface Activity {
  date: Date;
  type: ActivityType;
  duration: number; // in minutes
}

export function ActivityCalendar() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDayClick = (day: Date | undefined) => {
    if (day) {
      setSelectedDate(day);
      setIsModalOpen(true);
    }
  };

  const handleAddActivity = (activity: Omit<Activity, 'date'>) => {
    if (selectedDate) {
      const newActivity: Activity = { ...activity, date: selectedDate };
      setActivities(prev => [...prev, newActivity].sort((a, b) => a.date.getTime() - b.date.getTime()));
    }
  };
  
  const modifiers = {
    active: activities.map(a => a.date),
  };
  const modifiersStyles = {
    active: {
      borderColor: 'hsl(var(--primary))',
      borderWidth: '2px',
    },
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleDayClick}
        className="rounded-md border"
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        locale={fr}
      />
      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddActivity}
        date={selectedDate}
      />
      <Card className="w-full lg:w-96">
        <CardHeader>
          <CardTitle>Activités enregistrées</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <ul className="space-y-2">
              {activities.map((act, index) => (
                <li key={index} className="text-sm p-2 rounded-md bg-muted">
                  <span className="font-semibold">{format(act.date, "d MMMM yyyy", { locale: fr })}:</span> {act.type} - {act.duration} minutes
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune activité pour le moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}