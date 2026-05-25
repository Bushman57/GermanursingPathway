import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Lock,
  LayoutDashboard,
  Mail,
  Loader2,
  CheckCircle2,
  Circle,
  Clock,
  LogOut,
  FileText,
  GraduationCap,
  Plane,
  Info,
} from "lucide-react";
import { getSession, signIn, signOut, type DummySession } from "@/lib/dummyAuth";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Student Portal — German Nursing Pathway" },
      {
        name: "description",
        content:
          "Track your application progress, documents, and milestones in your student portal.",
      },
    ],
  }),
  component: PortalPage,
});

function PortalPage() {
  const [session, setSession] = useState<DummySession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSession(getSession());
    setHydrated(true);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-20 px-4">
        {!hydrated ? null : session ? (
          <Dashboard session={session} onSignOut={() => { signOut(); setSession(null); }} />
        ) : (
          <LoginCard onSignIn={(s) => setSession(s)} />
        )}
      </main>
      <Footer />
    </div>
  );
}

function LoginCard({ onSignIn }: { onSignIn: (s: DummySession) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Enter your email and password to continue.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    onSignIn(signIn(email));
    setLoading(false);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30";

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Student Portal</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to track your application progress.
        </p>
      </div>

      <div className="bg-warm-light/40 border border-warm/20 text-foreground/80 rounded-xl px-4 py-3 mb-6 flex items-start gap-2 text-xs">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-warm" />
        <span>
          <strong className="font-semibold">Phase 2 preview.</strong> Real authentication is coming
          soon — for now any email + password will sign you in to see the dashboard layout.
        </span>
      </div>

      <form
        onSubmit={submit}
        className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium">Password</label>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setError("Password reset will be available in Phase 2.")}
            >
              Forgot password?
            </button>
          </div>
          <input
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        <Button type="submit" variant="warm" size="lg" className="w-full py-6" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in…
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" /> Sign in
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          New here?{" "}
          <Link to="/register" className="text-warm font-medium hover:underline">
            Register your interest
          </Link>{" "}
          first.
        </p>
      </form>
    </div>
  );
}

type Stage = {
  key: string;
  title: string;
  description: string;
  status: "done" | "in_progress" | "pending";
  icon: React.ComponentType<{ className?: string }>;
};

const STAGES: Stage[] = [
  {
    key: "register",
    title: "Registration received",
    description: "We have your details and assigned you a case officer.",
    status: "done",
    icon: CheckCircle2,
  },
  {
    key: "eligibility",
    title: "Eligibility review",
    description: "Your qualifications and German level are being verified.",
    status: "done",
    icon: FileText,
  },
  {
    key: "documents",
    title: "Document collection",
    description: "Upload transcripts, certificates, and passport copy.",
    status: "in_progress",
    icon: FileText,
  },
  {
    key: "language",
    title: "German language training",
    description: "Enroll in A1–B2 pathway with our partner schools.",
    status: "pending",
    icon: GraduationCap,
  },
  {
    key: "placement",
    title: "Hospital placement",
    description: "Matching with German hospital and Ausbildung contract.",
    status: "pending",
    icon: GraduationCap,
  },
  {
    key: "visa",
    title: "Visa & travel",
    description: "Embassy appointment, visa issuance, and flight to Germany.",
    status: "pending",
    icon: Plane,
  },
];

function Dashboard({
  session,
  onSignOut,
}: {
  session: DummySession;
  onSignOut: () => void;
}) {
  const completed = STAGES.filter((s) => s.status === "done").length;
  const progress = Math.round((completed / STAGES.length) * 100);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <LayoutDashboard className="w-3.5 h-3.5" /> Student Portal
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold">
            Welcome back, {session.fullName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{session.email}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onSignOut} className="gap-2 self-start">
          <LogOut className="w-4 h-4" /> Sign out
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-heading font-semibold">Application progress</h2>
          <span className="text-sm text-muted-foreground">{progress}% complete</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full warm-gradient transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Stage {completed + 1} of {STAGES.length} —{" "}
          {STAGES.find((s) => s.status === "in_progress")?.title ?? "All stages complete"}
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-heading font-semibold mb-5">Your journey</h2>
        <ol className="space-y-5">
          {STAGES.map((stage, i) => (
            <li key={stage.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <StageDot status={stage.status} />
                {i < STAGES.length - 1 && (
                  <div
                    className={`w-px flex-1 mt-1 ${
                      stage.status === "done" ? "bg-warm/60" : "bg-border"
                    }`}
                  />
                )}
              </div>
              <div className="pb-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-foreground">{stage.title}</h3>
                  <StatusBadge status={stage.status} />
                </div>
                <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        Need help? <Link to="/about" className="text-warm hover:underline">Contact your case officer</Link>.
      </p>
    </div>
  );
}

function StageDot({ status }: { status: Stage["status"] }) {
  if (status === "done")
    return (
      <div className="w-7 h-7 rounded-full warm-gradient flex items-center justify-center">
        <CheckCircle2 className="w-4 h-4 text-warm-foreground" />
      </div>
    );
  if (status === "in_progress")
    return (
      <div className="w-7 h-7 rounded-full bg-warm/15 border-2 border-warm flex items-center justify-center">
        <Clock className="w-3.5 h-3.5 text-warm" />
      </div>
    );
  return (
    <div className="w-7 h-7 rounded-full border-2 border-border flex items-center justify-center">
      <Circle className="w-3 h-3 text-muted-foreground" />
    </div>
  );
}

function StatusBadge({ status }: { status: Stage["status"] }) {
  const map = {
    done: { label: "Complete", cls: "bg-success/15 text-success" },
    in_progress: { label: "In progress", cls: "bg-warm/15 text-warm" },
    pending: { label: "Upcoming", cls: "bg-muted text-muted-foreground" },
  } as const;
  const { label, cls } = map[status];
  return (
    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  );
}
