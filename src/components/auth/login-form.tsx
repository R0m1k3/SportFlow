"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User } from "@/types"; // Import the User type

const formSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis."),
  password: z.string().min(1, "Le mot de passe est requis."),
});

export function LoginForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "admin",
      password: "admin",
    },
  });

  const handleLogin = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log("Attempting to log in with username:", values.username);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();

      if (response.ok) {
        const user: User = data.user;
        toast.success("Connexion réussie ! Redirection...");
        localStorage.setItem("loggedInUser", user.email);
        localStorage.setItem("userRole", user.role);
        router.push('/dashboard');
      } else {
        toast.error(data.message || "Nom d'utilisateur ou mot de passe incorrect.");
        console.log("Login failed:", data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Une erreur est survenue lors de la connexion.");
    }
  };

  return (
    <div className="w-full max-w-sm p-8 space-y-6 bg-card/80 dark:bg-card/50 backdrop-blur-lg rounded-2xl shadow-xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Connexion</h1>
        <p className="text-muted-foreground">
          Accédez à votre tableau de bord.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom d'utilisateur</FormLabel>
                <FormControl>
                  <Input placeholder="admin" {...field} className="h-12 text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <Input type="password" {...field} className="h-12 text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full text-lg py-6 group" type="submit" disabled={form.formState.isSubmitting}>
            Se connecter
            <LogIn className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </form>
      </Form>
    </div>
  );
}