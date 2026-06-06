import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BlogForm } from "@/components/admin/BlogForm";
import { adminListBlogs, adminUpdateBlog } from "@/lib/adminApi";
import type { BlogPost } from "@/lib/blogs";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/blogs/$slug/edit")({
  component: AdminBlogEdit,
});

function AdminBlogEdit() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminListBlogs()
      .then((items) => {
        const found = items.find((b) => b.slug === slug);
        if (!found) setError("Blog not found");
        else setBlog(found);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [slug]);

  if (error) return <p className="text-destructive">{error}</p>;
  if (!blog) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/admin/blogs">← Back to list</Link>
      </Button>
      <h1 className="font-heading text-2xl font-bold mb-6">Edit blog</h1>
      <BlogForm
        initial={blog}
        isNew={false}
        onSubmit={async (data) => {
          await adminUpdateBlog(slug, data);
          navigate({ to: "/admin/blogs" });
        }}
      />
    </div>
  );
}
