import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { adminDeleteResource, adminListResources } from "@/lib/adminApi";
import type { ResourceArticle } from "@/lib/resources";

export const Route = createFileRoute("/admin/resources/")({
  component: AdminResourcesList,
});

function AdminResourcesList() {
  const [items, setItems] = useState<(ResourceArticle & { isPublished?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    adminListResources()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm(`Delete resource "${slug}"?`)) return;
    try {
      await adminDeleteResource(slug);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-heading text-2xl font-bold">Resources</h1>
        <Button variant="warm" asChild>
          <Link to="/admin/resources/new">Add resource</Link>
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
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.slug} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{r.slug}</td>
                  <td className="px-4 py-3">{r.titleEn}</td>
                  <td className="px-4 py-3">{r.category}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/admin/resources/$slug/edit" params={{ slug: r.slug }}>
                        Edit
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(r.slug)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <p className="p-6 text-center text-muted-foreground">No resources yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
