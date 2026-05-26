import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle, X, Plus, Send, Paperclip, Trash2, FileText, Bot, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { fetchChatReply, type ChatMode } from "@/lib/chat/fetchChatReply";
import { fetchScholarshipBySlug } from "@/lib/api/scholarships";
import { scholarshipText, type Scholarship } from "@/lib/scholarships";

type Attachment = { name: string; size: number; type: string };
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
  createdAt: number;
};
type Thread = { id: string; title: string; messages: Message[]; createdAt: number };

export type ChatWidgetProps = {
  mode: ChatMode;
  title?: string;
  subtitle?: string;
  greeting?: string;
  placeholder?: string;
  enableUploads?: boolean;
  suggestions?: string[];
  scholarshipSlug?: string;
  side?: "right" | "left";
  accent?: "warm" | "primary";
  acceptFileTypes?: string;
  disclaimer?: string;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const LINK_RE = /(\/scholarships\/[a-z0-9-]+|\/eligibility|\/register|\/scholarships)/gi;

function renderMessageContent(
  content: string,
  labels: { eligibility: string; register: string; scholarships: string },
) {
  const parts = content.split(LINK_RE);
  return parts.map((part, i) => {
    if (part.match(/^\/scholarships\/[a-z0-9-]+$/i)) {
      const slug = part.replace("/scholarships/", "");
      return (
        <Link key={i} to="/scholarships/$slug" params={{ slug }} className="text-warm underline font-medium">
          {part}
        </Link>
      );
    }
    if (part === "/eligibility") {
      return (
        <Link key={i} to="/eligibility" className="text-warm underline font-medium">
          {labels.eligibility}
        </Link>
      );
    }
    if (part === "/register") {
      return (
        <Link key={i} to="/register" className="text-warm underline font-medium">
          {labels.register}
        </Link>
      );
    }
    if (part === "/scholarships") {
      return (
        <Link key={i} to="/scholarships" className="text-warm underline font-medium">
          {labels.scholarships}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function ChatWidget({
  mode,
  title,
  subtitle,
  greeting,
  placeholder,
  enableUploads = false,
  suggestions,
  scholarshipSlug,
  side = "right",
  accent = "warm",
  acceptFileTypes = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  disclaimer,
}: ChatWidgetProps) {
  const { t, i18n } = useTranslation("chat");
  const [program, setProgram] = useState<Scholarship | undefined>();

  useEffect(() => {
    if (!scholarshipSlug) {
      setProgram(undefined);
      return;
    }
    fetchScholarshipBySlug(scholarshipSlug)
      .then(setProgram)
      .catch(() => setProgram(undefined));
  }, [scholarshipSlug]);
  const chatKey = scholarshipSlug ? "scholarshipDetail" : mode === "scholarship" ? "scholarship" : "pathway";
  const programTitle = program ? scholarshipText(program, "title", i18n.language) : "";
  const programProvider = program ? scholarshipText(program, "provider", i18n.language) : "";
  const resolvedTitle = title ?? t(`${chatKey}.title`);
  const resolvedSubtitle =
    subtitle ?? t(`${chatKey}.subtitle`, { provider: programProvider || "—" });
  const resolvedGreeting =
    greeting ??
    t(`${chatKey}.greeting`, { title: programTitle || "…", provider: programProvider || "…" });
  const resolvedPlaceholder = placeholder ?? t(`${chatKey}.placeholder`);
  const resolvedDisclaimer = disclaimer ?? t(`${chatKey}.disclaimer`);
  const resolvedSuggestions =
    suggestions ?? (t(`${chatKey}.suggestions`, { returnObjects: true }) as string[]);
  const linkLabels = {
    eligibility: t("links.eligibility"),
    register: t("links.register"),
    scholarships: t("links.scholarships"),
  };
  const newConvoLabel = t("ui.newConversation");
  const [open, setOpen] = useState(false);
  const [showThreads, setShowThreads] = useState(false);
  const [threads, setThreads] = useState<Thread[]>(() => [
    { id: uid(), title: newConvoLabel, messages: [{ id: uid(), role: "assistant", content: resolvedGreeting, createdAt: Date.now() }], createdAt: Date.now() },
  ]);
  const [activeId, setActiveId] = useState<string>(() => "");
  const [input, setInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // initialize active thread on mount
  useEffect(() => {
    setActiveId((id) => id || threads[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = threads.find((t) => t.id === activeId) ?? threads[0];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [active?.messages.length, isTyping, error]);

  const newThread = () => {
    const t: Thread = {
      id: uid(),
      title: newConvoLabel,
      messages: [{ id: uid(), role: "assistant", content: resolvedGreeting, createdAt: Date.now() }],
      createdAt: Date.now(),
    };
    setThreads((prev) => [t, ...prev]);
    setActiveId(t.id);
    setShowThreads(false);
    setError(null);
  };

  const deleteThread = (id: string) => {
    setThreads((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (next.length === 0) {
        const fresh: Thread = {
          id: uid(),
          title: newConvoLabel,
          messages: [{ id: uid(), role: "assistant", content: resolvedGreeting, createdAt: Date.now() }],
          createdAt: Date.now(),
        };
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  };

  const send = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text && pendingFiles.length === 0) return;

    const attachments: Attachment[] = pendingFiles.map((f) => ({ name: f.name, size: f.size, type: f.type }));
    const displayText = text || `Shared ${attachments.length} file(s)`;
    const userMsg: Message = {
      id: uid(),
      role: "user",
      content: displayText,
      attachments: attachments.length ? attachments : undefined,
      createdAt: Date.now(),
    };

    const historyForApi = [...(active?.messages ?? []), userMsg]
      .filter((m) => m.content)
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content }));

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeId
          ? {
              ...t,
              title: t.messages.length <= 1 ? (text ? text.slice(0, 40) : `${attachments.length} file(s)`) : t.title,
              messages: [...t.messages, userMsg],
            }
          : t,
      ),
    );
    setInput("");
    setPendingFiles([]);
    setIsTyping(true);
    setError(null);

    try {
      const replyText = await fetchChatReply({
        mode,
        messages: historyForApi,
        scholarshipSlug,
        attachmentNames: attachments.map((a) => a.name),
        locale: i18n.language.startsWith("de") ? "de" : "en",
      });
      const reply: Message = { id: uid(), role: "assistant", content: replyText, createdAt: Date.now() };
      setThreads((prev) => prev.map((t) => (t.id === activeId ? { ...t, messages: [...t.messages, reply] } : t)));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("ui.errorGeneric"));
    } finally {
      setIsTyping(false);
    }
  };

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 5);
    setPendingFiles((prev) => [...prev, ...arr].slice(0, 5));
  };

  const accentBg = accent === "warm" ? "bg-warm hover:bg-warm/90 text-warm-foreground" : "bg-primary hover:bg-primary/90 text-primary-foreground";
  const accentRing = accent === "warm" ? "focus:ring-warm/40" : "focus:ring-primary/40";
  const sideClass = side === "right" ? "right-4 sm:right-6" : "left-4 sm:left-6";

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "fixed bottom-5 z-50 flex items-center gap-2 rounded-full px-4 py-3 shadow-2xl transition-transform hover:scale-105",
            accentBg,
            sideClass,
          )}
          aria-label={`Open ${resolvedTitle}`}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">{resolvedTitle}</span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          className={cn(
            "fixed bottom-4 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[80vh] sm:h-[600px] max-h-[calc(100vh-2rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden",
            sideClass,
          )}
        >
          {/* Header */}
          <header className={cn("flex items-center gap-3 px-4 py-3 text-white", accent === "warm" ? "bg-gradient-to-r from-warm to-warm/80" : "hero-gradient")}>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{resolvedTitle}</h3>
              <p className="text-xs text-white/80 truncate">{resolvedSubtitle}</p>
            </div>
            <button onClick={() => setShowThreads((v) => !v)} className="p-1.5 hover:bg-white/15 rounded-md" aria-label="Conversations">
              <MessageCircle className="w-4 h-4" />
            </button>
            <button onClick={newThread} className="p-1.5 hover:bg-white/15 rounded-md" aria-label="New conversation">
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/15 rounded-md" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </header>

          {/* Threads sidebar overlay */}
          {showThreads && (
            <div className="absolute inset-0 top-[60px] bg-card z-10 flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conversations</h4>
                <button onClick={newThread} className="text-xs font-medium text-warm hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {threads.map((t) => (
                  <div
                    key={t.id}
                    className={cn(
                      "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-muted",
                      t.id === activeId && "bg-muted",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveId(t.id);
                        setShowThreads(false);
                        setError(null);
                      }}
                      className="flex-1 min-w-0 text-left"
                    >
                      <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{t.messages.length} messages</p>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteThread(t.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground text-center py-2 border-t border-border px-2">
                Conversations are not saved across page reloads.
              </p>
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50">
            {active?.messages.map((m) => (
              <div key={m.id} className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-warm/15 text-warm flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                    m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm",
                  )}
                >
                  {m.content && (
                    <p className="whitespace-pre-wrap break-words">
                      {renderMessageContent(m.content, linkLabels)}
                    </p>
                  )}
                  {m.attachments?.map((a, i) => (
                    <div key={i} className={cn("mt-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs", m.role === "user" ? "bg-primary-foreground/15" : "bg-background border border-border")}>
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate flex-1">{a.name}</span>
                      <span className="opacity-70">{(a.size / 1024).toFixed(0)}KB</span>
                    </div>
                  ))}
                </div>
                {m.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {error && !isTyping && (
              <div className="flex gap-2 items-start rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-destructive font-medium">Couldn&apos;t get a reply</p>
                  <p className="text-muted-foreground text-xs mt-1">{error}</p>
                  <button type="button" onClick={() => setError(null)} className="text-xs text-warm mt-2 hover:underline">
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {isTyping && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-warm/15 text-warm flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-sm px-3.5 py-3 flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:120ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:240ms]" />
                </div>
              </div>
            )}

            {/* Suggestions */}
            {active && active.messages.length <= 1 && resolvedSuggestions.length > 0 && !isTyping && (
              <div className="pt-2 flex flex-wrap gap-2">
                {resolvedSuggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => void send(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted text-foreground transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pending files */}
          {pendingFiles.length > 0 && (
            <div className="px-3 pt-2 flex flex-wrap gap-1.5 border-t border-border">
              {pendingFiles.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 text-xs bg-muted rounded-md px-2 py-1">
                  <FileText className="w-3 h-3" />
                  <span className="max-w-[120px] truncate">{f.name}</span>
                  <button onClick={() => setPendingFiles((p) => p.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="border-t border-border bg-card"
          >
            <div className="p-3 flex items-end gap-2">
            {enableUploads && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept={acceptFileTypes}
                  onChange={(e) => onFiles(e.target.files)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  aria-label="Attach files"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={1}
              disabled={isTyping}
              placeholder={resolvedPlaceholder}
              className={cn(
                "flex-1 resize-none bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 max-h-32 disabled:opacity-60",
                accentRing,
              )}
            />
            <Button
              type="submit"
              size="icon"
              variant={accent === "warm" ? "warm" : "default"}
              disabled={isTyping || (!input.trim() && pendingFiles.length === 0)}
            >
              <Send className="w-4 h-4" />
            </Button>
            </div>
            {resolvedDisclaimer && (
              <p className="px-3 pb-2 text-[10px] text-muted-foreground leading-snug">{resolvedDisclaimer}</p>
            )}
          </form>
        </div>
      )}
    </>
  );
}
