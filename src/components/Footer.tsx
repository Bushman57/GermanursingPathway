import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg warm-gradient flex items-center justify-center">
                <span className="font-heading text-sm font-bold text-warm-foreground">KD</span>
              </div>
              <span className="font-heading text-lg font-bold">
                Kenya<span className="text-warm">Desk</span>
              </span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Connecting Kenyan professionals with career opportunities in Germany.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/how-it-works" className="block text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">How It Works</Link>
              <Link to="/about" className="block text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">About Us</Link>
              <Link to="/eligibility" className="block text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Check Eligibility</Link>
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-sm text-primary-foreground/70">
              <p>info@kenyadesk.com</p>
              <p>Nairobi, Kenya</p>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} KenyaDesk. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
