import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon } from "lucide-react";
import destinationIcon from "@/assets/destination.svg";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isLanding ? 'bg-transparent border-transparent' : 'backdrop-blur-xl bg-black/20 border-b border-white/10'
      }`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
          <img src={destinationIcon} alt="Travel Buddy" className="h-8 w-8 transition-transform group-hover:scale-110" />
          <span className="font-light text-xl text-white tracking-[0.15em] italic">
            Travel Buddy
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full backdrop-blur-sm bg-white/5 hover:bg-white/15 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-110"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-white" /> : <Moon className="h-4 w-4 text-white" />}
          </button>

          {!user ? (
            <>
              <Link to="/login">
                <Button
                  size="sm"
                  className="border border-white/20 rounded-full bg-white/5 hover:bg-white/15 text-white transition-all duration-300 hover:scale-105 hover:border-white/40"
                >
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button
                  size="sm"
                  className="border border-white/30 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-300 hover:scale-105 hover:border-white/50"
                >
                  Get Started
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors ${location.pathname === '/dashboard'
                  ? 'text-white'
                  : 'text-white/60 hover:text-white'
                  }`}
              >
                Dashboard
              </Link>
              <Link
                to="/ai-assistant"
                className={`text-sm font-medium transition-colors ${location.pathname === '/ai-assistant'
                  ? 'text-white'
                  : 'text-white/60 hover:text-white'
                  }`}
              >
                AI Assistant
              </Link>
              <Link
                to="/profile"
                className={`text-sm font-medium transition-colors ${location.pathname === '/profile'
                  ? 'text-white'
                  : 'text-white/60 hover:text-white'
                  }`}
              >
                Profile
              </Link>
              <Button
                size="sm"
                onClick={handleLogout}
                className="border border-white/20 rounded-full bg-white/5 hover:bg-white/15 text-white transition-all duration-300 hover:scale-105"
              >
                Logout
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="md:hidden backdrop-blur-xl bg-black/30 border-t border-white/10 p-4 space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Theme Toggle for Mobile */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 p-3 rounded-xl backdrop-blur-sm bg-white/5 hover:bg-white/15 border border-white/20 hover:border-white/30 transition-all text-white"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-5 w-5" />
                  <span className="text-sm font-medium">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5" />
                  <span className="text-sm font-medium">Dark Mode</span>
                </>
              )}
            </button>

            {!user ? (
              <>
                {isLanding && (
                  <>
                    <a
                      href="#features"
                      className="block text-sm font-medium text-white/60 hover:text-white transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Features
                    </a>
                    <a
                      href="#how-it-works"
                      className="block text-sm font-medium text-white/60 hover:text-white transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      How It Works
                    </a>
                  </>
                )}
                <div className="flex gap-2 pt-2">
                  <Link to="/login">
                    <Button
                      size="sm"
                      className="border border-white/20 rounded-full bg-white/5 hover:bg-white/15 text-white"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button
                      size="sm"
                      className="border border-white/30 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="block text-sm font-medium text-white/60 hover:text-white transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/ai-assistant"
                  className="block text-sm font-medium text-white/60 hover:text-white transition-colors"
                  onClick={() => setOpen(false)}
                >
                  AI Assistant
                </Link>
                <Link
                  to="/profile"
                  className="block text-sm font-medium text-white/60 hover:text-white transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Profile
                </Link>
                <div className="pt-2">
                  <Button
                    size="sm"
                    onClick={handleLogout}
                    className="w-full border border-white/20 rounded-full bg-white/5 hover:bg-white/15 text-white"
                  >
                    Logout
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
