import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg warm-gradient flex items-center justify-center">
              <span className="font-heading text-sm font-bold text-warm-foreground">GNP</span>
            </div>
            <span className="font-heading text-lg font-bold text-foreground">
              German<span className="text-warm">Pathway</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Button variant="warm" size="sm" asChild>
              <Link to="/eligibility">Check Eligibility</Link>
            </Button>
          </div>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg">
          <div className="px-4 py-4 space-y-3">
            <Link to="/" className="block text-sm font-medium text-foreground py-2" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <Link to="/how-it-works" className="block text-sm font-medium text-foreground py-2" onClick={() => setMobileOpen(false)}>
              How It Works
            </Link>
            <Link to="/about" className="block text-sm font-medium text-foreground py-2" onClick={() => setMobileOpen(false)}>
              About
            </Link>
            <Button variant="warm" size="sm" className="w-full" asChild>
              <Link to="/eligibility" onClick={() => setMobileOpen(false)}>Check Eligibility</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
