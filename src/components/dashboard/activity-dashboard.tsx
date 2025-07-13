"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bike, Dumbbell, HeartPulse, Dribbble } from "lucide-react";
import { format, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";

import { getActivities } from "@/lib/db";
import { Activity, ActivityType } from "@/types";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityModal } from "./activity-modal";
import { MonthlyStats } from "./monthly-stats";

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
      router.push("/login");
    } else {
      setUserEmail(email);
      fetchActivities(email);
    }
  }, [router]);

  const fetchActivities = async (email: string) => {
    const userActivities = await getActivities(email);
    setActivities(userActivities);
  };

  const handleDayClick = (day: Date | undefined) => {
    if (day) {
      setSelectedDate(day);
      setIsModalOpen(true);
    }
  };

  const handleSaveActivity = async () => {
    setIsModalOpen(false);
    if (userEmail) {
      fetchActivities(userEmail);
    }
  };

  if (!userEmail) {
    return <p>Redirection...</p>;
  }

  const DayContentWithDot = (props: { date: Date }) => {
    const formattedDay = format(props.date, "yyyy-MM-dd");
    const hasActivity = activities.some(act => act.date === formattedDay);
    return (
      <div className="relative h-full w-full flex items-center justify-center">
        <span>{format(props.date, "d")}</span>
        {hasActivity && <div className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-primary" />}
      </div>
    );
  };

  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 grid gap-4 md:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Calendrier des activités</CardTitle>
            <CardDescription>Cliquez sur une date pour ajouter une activité.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDayClick}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              components={{ DayContent: DayContentWithDot }}
              locale={fr}
              className="p-0"
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
                {activities.sort((a, b) => b.date.localeCompare(a.date)).map((act) => (
                  <div key={act.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="p-2 bg-background rounded-full shadow-sm">
                      {activityIcons[act.type]}
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold capitalize">{act.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(act.date.replace(/-/g, '/')), "d MMMM yyyy", { locale: fr })}
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