import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon } from "lucide-react";
import destinationIcon from "@/assets/destination.svg";
import { useTheme } from "@/components/ThemeProvider";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const isLanding = location.pathname === "/";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch {
      toast({ title: "Error", description: "Failed to logout", variant: "destructive" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <img src={destinationIcon} alt="Wander Together" className="h-8 w-8" />
          <span className="font-display text-xl font-bold text-foreground">Wander Together</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {!user ? (
            <>
              {isLanding && (
                <>
                  <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
                  <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
                  <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
                </>
              )}
              <Link to="/login"><Button variant="hero-outline" size="sm">Login</Button></Link>
              <Link to="/signup"><Button variant="hero" size="sm">Get Started</Button></Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              <Link to="/ai-assistant" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">AI Assistant</Link>
              <Link to="/profile" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Profile</Link>
              <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
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
          {!user ? (
            <>
              {isLanding && (
                <>
                  <a href="#features" className="block text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>Features</a>
                  <a href="#how-it-works" className="block text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>How It Works</a>
                </>
              )}
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
              <div className="flex gap-2 items-center">
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
