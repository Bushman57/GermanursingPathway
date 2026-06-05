type Props = { url: string; title?: string };

function toEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.replace(/\//g, "");
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    if (u.pathname.includes("/embed/")) return url;
  } catch {
    return null;
  }
  return null;
}

export function VideoEmbed({ url, title }: Props) {
  const embed = toEmbed(url);
  if (!embed) return null;
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-muted aspect-video shadow-sm">
      <iframe
        src={embed}
        title={title ?? "Video"}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}

/** Extract first http(s) link that looks like a video (youtube/vimeo). */
export function extractVideoUrl(text: string | undefined | null): string | null {
  if (!text) return null;
  const match = text.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?[^\s]+|youtu\.be\/[^\s]+|vimeo\.com\/[^\s]+)/i);
  return match ? match[0] : null;
}
