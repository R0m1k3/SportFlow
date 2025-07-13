import { UserManagement } from "@/components/dashboard/user-management";

export default function UsersPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
        <p className="text-muted-foreground">
          Ajouter, modifier ou supprimer des utilisateurs.
        </p>
      </header>
      <UserManagement />
    </div>
  );
}