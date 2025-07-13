"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, Bike, Dumbbell, HeartPulse, Dribbble } from "lucide-react";
import { format, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";

import { getActivities } from "@/lib/db";
import { Activity, ActivityType } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();
  const isMobile = useIsMobile();

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
      if (isMobile) {
        setIsDatePickerOpen(false);
      }
    }
  };

  const handleSaveActivity = async () => {
    setIsModalOpen(false);
    if (userEmail) {
      fetchActivities(userEmail);
    }
  };

  const modifiers = {
    active: activities.map(a => new Date(a.date)),
  };
  const modifiersStyles = {
    active: {
      borderColor: 'hsl(var(--primary))',
      borderWidth: '2px',
      borderRadius: 'var(--radius)',
    },
  };

  if (!userEmail) {
    return <p>Redirection...</p>;
  }

  const calendarComponent = (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={handleDayClick}
      month={currentMonth}
      onMonthChange={setCurrentMonth}
      className="p-0"
      classNames={{
        head_cell: "text-muted-foreground rounded-md w-9 h-9 sm:w-10 sm:h-10 font-normal text-[0.8rem]",
        cell: "h-9 w-9 sm:h-10 sm:w-10 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: "h-9 w-9 sm:h-10 sm:w-10 p-0 font-normal aria-selected:opacity-100",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
      }}
      modifiers={modifiers}
      modifiersStyles={modifiersStyles}
      locale={fr}
      initialFocus
    />
  );

  return (
    <div className="grid gap-4 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {isMobile ? (
          <Card>
            <CardHeader>
              <CardTitle>Enregistrer une activité</CardTitle>
              <CardDescription>
                Choisissez une date pour noter votre séance de sport.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className="w-full justify-start text-left font-normal h-12 text-base">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="capitalize">{format(currentMonth, "MMMM yyyy", { locale: fr })}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  {calendarComponent}
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-1 sm:p-2 md:p-4 flex justify-center">
              {calendarComponent}
            </CardContent>
          </Card>
        )}
      </div>
      <div className="space-y-4 md:space-y-8">
        <MonthlyStats activities={activities} month={currentMonth} />
        <Card>
          <CardHeader>
            <CardTitle>Activités récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-3 h-64 overflow-y-auto pr-2">
                {activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((act) => (
                  <div key={act.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="p-2 bg-background rounded-full shadow-sm">
                      {activityIcons[act.type]}
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold capitalize">{act.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(act.date), "d MMMM yyyy", { locale: fr })}
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