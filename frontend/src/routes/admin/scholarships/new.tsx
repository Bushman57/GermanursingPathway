import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ScholarshipForm } from "@/components/admin/ScholarshipForm";
import { adminCreateScholarship } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/scholarships/new")({
  component: AdminScholarshipNew,
});

function AdminScholarshipNew() {
  const navigate = useNavigate();

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/admin/scholarships">← Back to list</Link>
      </Button>
      <h1 className="font-heading text-2xl font-bold mb-6">New scholarship</h1>
      <ScholarshipForm
        isNew
        onSubmit={async (data) => {
          await adminCreateScholarship(data);
          navigate({ to: "/admin/scholarships" });
        }}
      />
    </div>
  );
}
