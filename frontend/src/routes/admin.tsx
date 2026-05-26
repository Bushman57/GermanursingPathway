import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminToken } from "@/lib/adminAuth";
import { metaTags } from "@/lib/routeHead";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/admin/login") return;
    if (!getAdminToken()) {
      throw redirect({ to: "/admin/login" });
    }
  },
  head: () => ({
    meta: metaTags({
      title: "Admin — German Nursing Pathway",
      description: "Content administration",
    }),
  }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <>
      <AdminShell />
    </>
  );
}
