import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-background">
      <main className="flex flex-col items-center text-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Activity className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Suivi d'Activité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Bienvenue sur votre application de suivi d'activités sportives. Connectez-vous pour commencer.
            </p>
            <Link href="/login" passHref>
              <Button size="lg" className="w-full">
                Aller à la page de connexion
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}