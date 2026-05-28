import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Bell, Sun, Moon, Menu, X, User, Store, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV_LINKS = [
  { href: "/profile", label: "Profile", icon: <User className="w-3.5 h-3.5" /> },
  { href: "/seller-upgrade", label: "Become a Seller", icon: <Store className="w-3.5 h-3.5" /> },
  { href: "/seller-dashboard", label: "Seller Dashboard", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
];

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/profile">
            <span className="flex items-center gap-2 cursor-pointer" data-testid="logo">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                <Search className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">
                PriceCheck <span className="text-primary">NG</span>
              </span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    location === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              data-testid="theme-toggle"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <Button variant="ghost" size="icon" data-testid="notifications-bell" className="text-muted-foreground hover:text-foreground">
              <Bell className="w-4 h-4" />
            </Button>

            <button onClick={() => setLocation("/profile")} data-testid="user-avatar">
              <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">EO</AvatarFallback>
              </Avatar>
            </button>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-border">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${
                      location === link.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.icon} {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
