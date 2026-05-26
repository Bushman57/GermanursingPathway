import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { adminListResources, adminUpdateResource } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/resources/$slug/edit")({
  loader: async ({ params }) => {
    const items = await adminListResources();
    const item = items.find((r) => r.slug === params.slug);
    if (!item) throw new Error("Resource not found");
    return item;
  },
  component: AdminResourceEdit,
});

function AdminResourceEdit() {
  const resource = Route.useLoaderData();
  const navigate = useNavigate();

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/admin/resources">← Back to list</Link>
      </Button>
      <h1 className="font-heading text-2xl font-bold mb-6">Edit: {resource.titleEn}</h1>
      <ResourceForm
        initial={resource}
        isNew={false}
        onSubmit={async (data) => {
          await adminUpdateResource(resource.slug, data);
          navigate({ to: "/admin/resources" });
        }}
      />
    </div>
  );
}
