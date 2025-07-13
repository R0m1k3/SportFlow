"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bike, Dumbbell, HeartPulse, Dribbble } from "lucide-react";
import { format, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { DayContentProps, DayModifiers } from "react-day-picker";
import { cn } from "@/lib/utils";

import { Activity, ActivityType } from "@/types";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityModal } from "./activity-modal";
import { MonthlyStats } from "./monthly-stats";
import { toast } from "sonner";

const activityIcons: Record<ActivityType, React.ReactNode> = {
  vélo: <Bike className="h-5 w-5" />,
  musculation: <Dumbbell className="h-5 w-5" />,
  fitness: <HeartPulse className="h-5 w-5" />,
  basket: <Dribbble className="h-5 w-5" />,
};

export function ActivityDashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem("loggedInUser");
    if (!email) {
      router.push("/");
    } else {
      setUserEmail(email);
      fetchActivities(email);
    }
  }, [router]);

  const fetchActivities = async (email: string) => {
    try {
      const response = await fetch(`/api/activities?userEmail=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      const userActivities: Activity[] = await response.json();
      setActivities(userActivities.sort((a, b) => b.date.localeCompare(a.date)));
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      toast.error("Impossible de charger les activités.");
    }
  };

  const handleDayClick = (day: Date | undefined, modifiers: DayModifiers) => {
    // Defensive handler to prevent crashes from invalid data
    if (!day || !(day instanceof Date) || isNaN(day.getTime()) || !modifiers || modifiers.disabled) {
      return;
    }

    // Check if the clicked day is the same as the already selected day
    if (selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) {
      // Second click on the same day, open the modal
      setIsModalOpen(true);
    } else {
      // First click or click on a new day, just select it
      setSelectedDate(day);
    }
  };

  const handleSaveActivity = (newActivity: Activity) => {
    setIsModalOpen(false);
    setActivities(prevActivities =>
      [...prevActivities, newActivity].sort((a, b) => b.date.localeCompare(a.date))
    );
  };

  if (!userEmail) {
    return <p>Redirection...</p>;
  }

  const DayContentWithActivity = (props: DayContentProps) => {
    // Bulletproof guard to prevent render crash from invalid dates
    if (!props.date || !(props.date instanceof Date) || isNaN(props.date.getTime())) {
      return <div />;
    }
    
    const formattedDay = format(props.date, "yyyy-MM-dd");
    const hasActivity = activities.some(act => act.date === formattedDay);
    
    return (
      <div
        className={cn(
          "h-full w-full flex items-center justify-center rounded-md",
          hasActivity && !props.activeModifiers.selected && "bg-green-100 dark:bg-green-900"
        )}
      >
        {format(props.date, "d")}
      </div>
    );
  };

  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 grid gap-4 md:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Calendrier des activités</CardTitle>
            <CardDescription>Cliquez sur une date pour la sélectionner, cliquez à nouveau pour ajouter une activité.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onDayClick={handleDayClick}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              components={{ DayContent: DayContentWithActivity }}
              locale={fr}
              className="w-full"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4 w-full",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                table: "w-full border-collapse space-y-1",
                head_row: "flex w-full",
                head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "flex-1 h-16 text-center text-sm p-0 relative",
                day: "w-full h-full flex items-center justify-center p-0 font-normal",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Activités récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-3 h-64 overflow-y-auto pr-2">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="p-2 bg-background rounded-full shadow-sm">
                      {activityIcons[act.type]}
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold capitalize">{act.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(act.date + 'T00:00:00'), "d MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{act.duration} min</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune activité pour le moment.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4 md:space-y-8">
        <MonthlyStats activities={activities} month={currentMonth} />
      </div>
      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveActivity}
        date={selectedDate}
        userEmail={userEmail}
      />
    </div>
  );
}