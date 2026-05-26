import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { adminDeleteScholarship, adminListScholarships } from "@/lib/adminApi";
import type { Scholarship } from "@/lib/scholarships";

export const Route = createFileRoute("/admin/scholarships/")({
  component: AdminScholarshipsList,
});

function AdminScholarshipsList() {
  const [items, setItems] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    adminListScholarships()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm(`Delete scholarship "${slug}"?`)) return;
    try {
      await adminDeleteScholarship(slug);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-heading text-2xl font-bold">Scholarships</h1>
        <Button variant="warm" asChild>
          <Link to="/admin/scholarships/new">Add scholarship</Link>
        </Button>
      </div>
      {loading && <p className="text-muted-foreground">Loading…</p>}
      {error && <p className="text-destructive text-sm">{error}</p>}
      {!loading && !error && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Verified</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.slug} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{s.slug}</td>
                  <td className="px-4 py-3">{s.title}</td>
                  <td className="px-4 py-3">{s.verified ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/admin/scholarships/$slug/edit" params={{ slug: s.slug }}>
                        Edit
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(s.slug)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <p className="p-6 text-center text-muted-foreground">No scholarships yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
