import { Link, useLocation } from "wouter";
import {
  Search,
  MessageCircle,
  Sun,
  Moon,
  Home,
  Ratio,
  Heart,
  User,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

const NAV_LINKS: {
  href: string;
  label: string;
  icon: LucideIcon;
  testId: string;
  activeIconClass: string;
  activeLabelClass: string;
}[] = [
  {
    href: "/",
    label: "Home",
    icon: Home,
    testId: "nav-home",
    activeIconClass: "text-blue-600",
    activeLabelClass: "text-blue-600",
  },
  {
    href: "/search",
    label: "Search",
    icon: Search,
    testId: "nav-search",
    activeIconClass: "text-foreground",
    activeLabelClass: "text-foreground",
  },
  {
    href: "/compare",
    label: "Compare",
    icon: Ratio,
    testId: "nav-compare",
    activeIconClass: "text-foreground",
    activeLabelClass: "text-foreground",
  },
  {
    href: "/saved",
    label: "Saved",
    icon: Heart,
    testId: "nav-saved",
    activeIconClass: "text-foreground",
    activeLabelClass: "text-foreground",
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    testId: "nav-profile",
    activeIconClass: "text-foreground",
    activeLabelClass: "text-foreground",
  },
];

function isNavActive(location: string, href: string) {
  if (href === "/") return location === "/" || location === "";
  return location === href || location.startsWith(`${href}/`);
}

export default function Navbar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const chatActive = location === "/chat" || location.startsWith("/chat/");

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-4">
            <Link href="/">
              <span className="flex items-center gap-2 cursor-pointer shrink-0" data-testid="logo">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                  <Search className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg text-foreground">
                  PriceCheck <span className="text-primary">NG</span>
                </span>
              </span>
            </Link>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                data-testid="theme-toggle"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-muted-foreground hover:text-foreground"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                data-testid="chat-toggle"
                className={
                  chatActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }
                asChild
              >
                <Link href="/chat" aria-label="Chat">
                  <MessageCircle className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <footer
        className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-[0_-2px_12px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]"
        aria-label="Main navigation"
      >
        <nav className="max-w-xl mx-auto w-full">
          <div className="flex items-stretch justify-between h-[4.5rem] px-4 sm:px-8 gap-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = isNavActive(location, link.href);
              const isHome = link.href === "/";
              return (
                <Link key={link.href} href={link.href}>
                  <span
                    data-testid={link.testId}
                    className={`flex flex-col items-center justify-center gap-1.5 flex-1 min-w-0 px-2 py-2 cursor-pointer transition-colors ${
                      active ? link.activeLabelClass : "text-muted-foreground"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 sm:w-7 sm:h-7 stroke-[1.75] shrink-0 ${
                        active
                          ? isHome
                            ? "text-blue-600 fill-blue-600/15"
                            : link.activeIconClass
                          : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`text-[10px] sm:text-[11px] font-medium leading-tight text-center ${
                        active
                          ? isHome
                            ? "text-blue-600"
                            : "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {link.label}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </footer>
    </>
  );
}
