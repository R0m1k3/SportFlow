import { ActivityCalendar } from "@/components/dashboard/activity-calendar";
import { MadeWithDyad } from "@/components/made-with-dyad";

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Sélectionnez un jour pour ajouter ou voir une activité.
        </p>
      </header>
      <main className="flex justify-center">
        <ActivityCalendar />
      </main>
      <div className="absolute bottom-4 w-full text-center">
        <MadeWithDyad />
      </div>
    </div>
  );
}