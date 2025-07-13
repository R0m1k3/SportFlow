import { Activity, ActivityType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Clock, Dumbbell, Bike, Dribbble, HeartPulse } from "lucide-react";

interface MonthlyStatsProps {
  activities: Activity[];
  month: Date;
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
  vélo: <Bike className="h-4 w-4 text-muted-foreground" />,
  musculation: <Dumbbell className="h-4 w-4 text-muted-foreground" />,
  fitness: <HeartPulse className="h-4 w-4 text-muted-foreground" />,
  basket: <Dribbble className="h-4 w-4 text-muted-foreground" />,
};

export function MonthlyStats({ activities, month }: MonthlyStatsProps) {
  const monthlyActivities = activities.filter(
    (act) => {
      // Parse YYYY-MM-DD string to avoid timezone issues.
      // Using YYYY/MM/DD format is more robust for the Date constructor.
      const activityDate = new Date(act.date.replace(/-/g, '/'));
      return activityDate.getMonth() === month.getMonth() && activityDate.getFullYear() === month.getFullYear()
    }
  );

  const totalSessions = monthlyActivities.length;
  const totalDuration = monthlyActivities.reduce((sum, act) => sum + act.duration, 0);
  
  const statsByType = monthlyActivities.reduce((acc, act) => {
    if (!acc[act.type]) {
      acc[act.type] = { sessions: 0, duration: 0 };
    }
    acc[act.type].sessions += 1;
    acc[act.type].duration += act.duration;
    return acc;
  }, {} as Record<ActivityType, { sessions: number; duration: number }>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart className="mr-2 h-5 w-5" />
          Statistiques de {month.toLocaleString('fr-FR', { month: 'long' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Durée totale : <strong>{Math.floor(totalDuration / 60)}h {totalDuration % 60}min</strong></span>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">Détails par activité :</h4>
          {Object.entries(statsByType).length > 0 ? (
            <ul className="space-y-1 pl-4">
              {Object.entries(statsByType).map(([type, data]) => (
                <li key={type} className="flex items-center text-sm">
                  {activityIcons[type as ActivityType]}
                  <span className="ml-2 capitalize">{type}: <strong>{data.sessions}</strong> sessions, <strong>{Math.floor(data.duration / 60)}h {data.duration % 60}min</strong></span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground pl-4">Aucune activité ce mois-ci.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}