import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { adminCreateResource } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/resources/new")({
  component: AdminResourceNew,
});

function AdminResourceNew() {
  const navigate = useNavigate();

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/admin/resources">← Back to list</Link>
      </Button>
      <h1 className="font-heading text-2xl font-bold mb-6">New resource</h1>
      <ResourceForm
        isNew
        onSubmit={async (data) => {
          await adminCreateResource(data);
          navigate({ to: "/admin/resources" });
        }}
      />
    </div>
  );
}
