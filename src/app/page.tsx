import { LoginForm } from "@/components/auth/login-form";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-background dark:to-slate-900">
      <LoginForm />
    </div>
  );
}