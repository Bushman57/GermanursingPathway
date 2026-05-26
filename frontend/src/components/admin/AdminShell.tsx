import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { clearAdminToken } from "@/lib/adminAuth";

export function AdminShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (pathname === "/admin/login") {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="font-heading font-bold text-lg text-foreground">Content Admin</div>
          <nav className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/scholarships">Scholarships</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/resources">Resources</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearAdminToken();
                window.location.href = "/admin/login";
              }}
            >
              Log out
            </Button>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
