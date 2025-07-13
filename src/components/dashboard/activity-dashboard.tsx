"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { ActivityModal } from "./activity-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { getActivities } from "@/lib/db";
import { Activity } from "@/types";
import { MonthlyStats } from "./monthly-stats";

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

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-2 sm:p-4 md:p-6 flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDayClick}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="text-base"
              classNames={{
                head_cell: "w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20",
                cell: "w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20",
              }}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              locale={fr}
            />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-8">
        <MonthlyStats activities={activities} month={currentMonth} />
        <Card>
          <CardHeader>
            <CardTitle>Activités enregistrées</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <ul className="space-y-2 h-64 overflow-y-auto">
                {activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((act) => (
                  <li key={act.id} className="text-sm p-2 rounded-md bg-muted">
                    <span className="font-semibold">{format(new Date(act.date), "d MMMM yyyy", { locale: fr })}:</span> {act.type} - {act.duration} minutes
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune activité pour le moment.</p>
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