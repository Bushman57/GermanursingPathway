import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BlogForm } from "@/components/admin/BlogForm";
import { adminCreateBlog } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/blogs/new")({
  component: AdminBlogNew,
});

function AdminBlogNew() {
  const navigate = useNavigate();

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/admin/blogs">← Back to list</Link>
      </Button>
      <h1 className="font-heading text-2xl font-bold mb-6">New blog</h1>
      <BlogForm
        isNew
        onSubmit={async (data) => {
          await adminCreateBlog(data);
          navigate({ to: "/admin/blogs" });
        }}
      />
    </div>
  );
}
