"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/types";
import { addUser, updateUser } from "@/lib/db";
import { toast } from "sonner";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  user?: User;
}

export function UserFormModal({ isOpen, onClose, onSave, user }: UserFormModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPassword(""); // Don't pre-fill password
    } else {
      setName("");
      setEmail("");
      setPassword("");
    }
  }, [user, isOpen]);

  const handleSave = async () => {
    if (!name || !email || (!user && !password)) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }

    try {
      if (user) {
        const updatedUser: User = { ...user, name, email };
        if (password) {
          updatedUser.password = password;
        }
        await updateUser(updatedUser);
        toast.success("Utilisateur mis à jour avec succès.");
      } else {
        await addUser({ name, email, password });
        toast.success("Utilisateur ajouté avec succès.");
      }
      onSave();
    } catch (error) {
      toast.error("Un utilisateur avec cet email existe déjà.");
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={user ? "Laisser vide pour ne pas changer" : ""} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="submit" onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}