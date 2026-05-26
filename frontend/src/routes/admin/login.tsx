import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { setAdminToken } from "@/lib/adminAuth";
import { FormField, TextInput } from "@/components/admin/FormField";
import { metaTags } from "@/lib/routeHead";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: metaTags({ title: "Admin login", description: "Sign in to manage site content" }),
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) {
      setError("Enter the admin secret.");
      return;
    }
    setAdminToken(secret);
    navigate({ to: "/admin/scholarships" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm"
      >
        <h1 className="font-heading text-2xl font-bold text-foreground">Admin sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the admin API secret configured on the server.
        </p>
        <div className="mt-6 space-y-4">
          <FormField label="Admin secret">
            <TextInput
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              autoComplete="current-password"
            />
          </FormField>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="warm" className="w-full">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
