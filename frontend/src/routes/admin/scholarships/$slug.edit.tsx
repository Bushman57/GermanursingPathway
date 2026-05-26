import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ScholarshipForm } from "@/components/admin/ScholarshipForm";
import { adminListScholarships, adminUpdateScholarship } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/scholarships/$slug/edit")({
  loader: async ({ params }) => {
    const items = await adminListScholarships();
    const item = items.find((s) => s.slug === params.slug);
    if (!item) throw new Error("Scholarship not found");
    return item;
  },
  component: AdminScholarshipEdit,
});

function AdminScholarshipEdit() {
  const scholarship = Route.useLoaderData();
  const navigate = useNavigate();

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/admin/scholarships">← Back to list</Link>
      </Button>
      <h1 className="font-heading text-2xl font-bold mb-6">Edit: {scholarship.title}</h1>
      <ScholarshipForm
        initial={scholarship}
        isNew={false}
        onSubmit={async (data) => {
          await adminUpdateScholarship(scholarship.slug, data);
          navigate({ to: "/admin/scholarships" });
        }}
      />
    </div>
  );
}
