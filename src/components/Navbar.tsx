import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Compass } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="gradient-primary rounded-lg p-1.5">
            <Compass className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">TravelMate</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {isLanding ? (
            <>
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
              <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
              <Link to="/login"><Button variant="hero-outline" size="sm">Login</Button></Link>
              <Link to="/signup"><Button variant="hero" size="sm">Get Started</Button></Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              <Link to="/ai-assistant" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">AI Assistant</Link>
              <Link to="/profile" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Profile</Link>
              <Button variant="ghost" size="sm" onClick={() => {}}>Logout</Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass border-t p-4 space-y-3">
          {isLanding ? (
            <>
              <a href="#features" className="block text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>Features</a>
              <a href="#how-it-works" className="block text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>How It Works</a>
              <div className="flex gap-2 pt-2">
                <Link to="/login"><Button variant="hero-outline" size="sm">Login</Button></Link>
                <Link to="/signup"><Button variant="hero" size="sm">Get Started</Button></Link>
              </div>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="block text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>Dashboard</Link>
              <Link to="/ai-assistant" className="block text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>AI Assistant</Link>
              <Link to="/profile" className="block text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>Profile</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
