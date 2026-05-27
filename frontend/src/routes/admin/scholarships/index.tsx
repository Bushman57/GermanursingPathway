import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { adminDeleteScholarship, adminListScholarships, type ScholarshipListFilters } from "@/lib/adminApi";
import {
  APPLICATION_STATUS_OPTIONS,
  DATA_VERIFICATION_STATUS_OPTIONS,
  optionLabel,
  PROGRAM_TYPE_OPTIONS,
} from "@/lib/scholarshipFieldOptions";
import type { Scholarship } from "@/lib/scholarships";

export const Route = createFileRoute("/admin/scholarships/")({
  component: AdminScholarshipsList,
});

function AdminScholarshipsList() {
  const [items, setItems] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<ScholarshipListFilters>({});

  const load = useCallback(() => {
    setLoading(true);
    const active: ScholarshipListFilters = {};
    if (filters.application_status) active.application_status = filters.application_status;
    if (filters.program_type) active.program_type = filters.program_type;
    if (filters.data_verification_status) {
      active.data_verification_status = filters.data_verification_status;
    }
    adminListScholarships(Object.keys(active).length ? active : undefined)
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (slug: string) => {
    if (!confirm(`Delete scholarship "${slug}"?`)) return;
    try {
      await adminDeleteScholarship(slug);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const selectClass =
    "px-2 py-1.5 rounded-lg border border-input bg-background text-sm";

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-heading text-2xl font-bold">Scholarships</h1>
        <Button variant="warm" asChild>
          <Link to="/admin/scholarships/new">Add scholarship</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 p-4 bg-muted/30 border border-border rounded-xl">
        <label className="text-sm">
          <span className="block text-xs text-muted-foreground mb-1">Application status</span>
          <select
            className={selectClass}
            value={filters.application_status ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, application_status: e.target.value || undefined }))
            }
          >
            <option value="">All</option>
            {APPLICATION_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-xs text-muted-foreground mb-1">Program type</span>
          <select
            className={selectClass}
            value={filters.program_type ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, program_type: e.target.value || undefined }))}
          >
            <option value="">All</option>
            {PROGRAM_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-xs text-muted-foreground mb-1">Data verification</span>
          <select
            className={selectClass}
            value={filters.data_verification_status ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, data_verification_status: e.target.value || undefined }))
            }
          >
            <option value="">All</option>
            {DATA_VERIFICATION_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p className="text-muted-foreground">Loading…</p>}
      {error && <p className="text-destructive text-sm">{error}</p>}
      {!loading && !error && (
        <div className="bg-card border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Program</th>
                <th className="px-4 py-3 font-medium">Application</th>
                <th className="px-4 py-3 font-medium">Admin status</th>
                <th className="px-4 py-3 font-medium">Verified</th>
                <th className="px-4 py-3 font-medium">Funding</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.slug} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{s.title}</div>
                    <div className="font-mono text-xs text-muted-foreground">{s.slug}</div>
                  </td>
                  <td className="px-4 py-3">{optionLabel(s.programType)}</td>
                  <td className="px-4 py-3">{optionLabel(s.applicationStatus)}</td>
                  <td className="px-4 py-3">{optionLabel(s.dataVerificationStatus)}</td>
                  <td className="px-4 py-3">{optionLabel(s.verificationStatus)}</td>
                  <td className="px-4 py-3">{optionLabel(s.funding) || s.funding}</td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
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
            <p className="p-6 text-center text-muted-foreground">No scholarships match these filters.</p>
          )}
        </div>
      )}
    </div>
  );
}
