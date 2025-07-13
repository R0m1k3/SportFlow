import { Button } from "@/components/ui/button";
import { Activity, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-background dark:to-slate-900">
      <main className="flex flex-col items-center text-center">
        <div className="w-full max-w-md p-8 space-y-8 bg-card/80 dark:bg-card/50 backdrop-blur-lg rounded-2xl shadow-xl">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Activity className="w-12 h-12 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Suivi d'Activité</h1>
            <p className="text-muted-foreground">
              Bienvenue sur votre application de suivi d'activités sportives. Connectez-vous pour commencer.
            </p>
          </div>
          <Link href="/login" passHref>
            <Button size="lg" className="w-full text-lg py-6 group">
              Aller à la page de connexion
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}