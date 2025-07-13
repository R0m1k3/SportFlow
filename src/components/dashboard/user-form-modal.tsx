"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { User, UserRole } from "@/types";
import { addUser, updateUser } from "@/lib/db";
import { toast } from "sonner";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  user: User | null;
}

export function UserFormModal({ isOpen, onClose, onSave, user }: UserFormModalProps) {
  const isEditing = !!user;

  const formSchema = z.object({
    name: z.string().min(1, "Le nom est requis."),
    email: z.string().email("L'email n'est pas valide."),
    password: z.string().optional(),
    role: z.enum(["user", "admin"]),
  });

  const editSchema = formSchema.extend({
    password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères.").optional().or(z.literal('')),
  });

  const createSchema = formSchema.extend({
    password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères."),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(isEditing ? editSchema : createSchema),
    defaultValues: { name: "", email: "", password: "", role: "user" },
  });

  useEffect(() => {
    if (isOpen) {
      if (user) {
        form.reset({ name: user.name, email: user.email, role: user.role, password: "" });
      } else {
        form.reset({ name: "", email: "", password: "", role: "user" });
      }
    }
  }, [isOpen, user, form]);

  const handleSave = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditing && user) {
        const updatedUserData: User = { ...user, ...values };
        await updateUser(updatedUserData);
        toast.success("Utilisateur mis à jour avec succès.");
      } else {
        const newUserData: Omit<User, 'id'> = {
          name: values.name,
          email: values.email,
          password: values.password!, // Password is required by createSchema
          role: values.role as UserRole,
        };
        await addUser(newUserData);
        toast.success("Utilisateur ajouté avec succès.");
      }
      onSave();
    } catch (error) {
      toast.error("Une erreur est survenue. L'email ou le nom est peut-être déjà utilisé.");
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)}>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Modifiez les informations ci-dessous." : "Remplissez les informations pour créer un nouvel utilisateur."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Nom</FormLabel>
                  <FormControl><Input {...field} className="col-span-3" /></FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Email</FormLabel>
                  <FormControl><Input type="email" {...field} className="col-span-3" /></FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Mot de passe</FormLabel>
                  <FormControl><Input type="password" placeholder={isEditing ? "Laisser vide pour ne pas changer" : ""} {...field} className="col-span-3" /></FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )} />
              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Rôle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">Utilisateur</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>Enregistrer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}