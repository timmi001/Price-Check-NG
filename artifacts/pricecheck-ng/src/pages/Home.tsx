import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  Search,
  MapPin,
  ChevronDown,
  Smartphone,
  Shirt,
  Monitor,
  Laptop,
  Home as HomeIcon,
  Car,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LOCATIONS = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ibadan",
  "Kano",
  "Benin City",
  "Enugu",
  "Kaduna",
];

function CategoryIcon({ id }: { id: string }) {
  switch (id) {
    case "phones":
      return <Smartphone className="w-7 h-7 text-blue-600" strokeWidth={2} />;
    case "fashion":
      return <Shirt className="w-7 h-7 text-orange-500" strokeWidth={2} />;
    case "electronics":
      return <ElectronicsIcon />;
    case "home":
      return <HomeIcon className="w-7 h-7 text-green-600" strokeWidth={2} />;
    case "cars":
      return <Car className="w-7 h-7 text-neutral-800" strokeWidth={2} />;
    default:
      return null;
  }
}

const CATEGORIES = [
  {
    id: "phones",
    name: "Phones",
    circleClass: "bg-blue-50 ring-1 ring-blue-100",
  },
  {
    id: "fashion",
    name: "Fashion",
    circleClass: "bg-orange-50 ring-1 ring-orange-100",
  },
  {
    id: "electronics",
    name: "Electronics",
    circleClass: "bg-violet-50 ring-1 ring-violet-100",
  },
  {
    id: "home",
    name: "Home",
    circleClass: "bg-green-50 ring-1 ring-green-100",
  },
  {
    id: "cars",
    name: "Cars",
    circleClass: "bg-neutral-100 ring-1 ring-neutral-200",
  },
] as const;

function ElectronicsIcon() {
  return (
    <span className="relative flex items-center justify-center w-8 h-7">
      <Monitor className="w-6 h-6 text-violet-600 absolute -top-0.5 left-0" strokeWidth={2} />
      <Laptop className="w-5 h-5 text-violet-700 absolute bottom-0 right-0" strokeWidth={2} />
    </span>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [area, setArea] = useState("Lagos");
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    params.set("location", area);
    const qs = params.toString();
    setLocation(qs ? `/search?${qs}` : "/search");
  };

  const openCategory = (categoryId: string) => {
    const params = new URLSearchParams({ category: categoryId, location: area });
    if (query.trim()) params.set("q", query.trim());
    setLocation(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 pt-4 pb-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Location header */}
          <Select value={area} onValueChange={setArea}>
            <SelectTrigger
              data-testid="location-selector"
              className="w-auto h-auto border-0 bg-transparent shadow-none p-0 gap-1.5 font-semibold text-foreground hover:opacity-80 focus:ring-0 [&>svg:last-child]:hidden"
              aria-label="Select location"
            >
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <span className="text-base">{area}, Nigeria</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </SelectTrigger>
            <SelectContent align="start">
              {LOCATIONS.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}, Nigeria
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search bar */}
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                data-testid="home-search-input"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, brands…"
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-muted/80 text-foreground placeholder:text-muted-foreground text-sm border-0 outline-none focus:ring-2 focus:ring-primary/25 transition-shadow"
              />
            </div>
          </form>

          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Categories</h2>
              <Link href="/search">
                <span
                  data-testid="categories-see-all"
                  className="text-sm font-medium text-primary hover:underline cursor-pointer"
                >
                  See all
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-5 gap-2 sm:gap-4">
              {CATEGORIES.map((cat, i) => (
                <motion.button
                  key={cat.id}
                  type="button"
                  data-testid={`category-${cat.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => openCategory(cat.id)}
                  className="flex flex-col items-center gap-2 min-w-0"
                >
                  <span
                    className={`flex items-center justify-center w-[4.25rem] h-[4.25rem] sm:w-[4.75rem] sm:h-[4.75rem] rounded-full ${cat.circleClass} shadow-sm`}
                  >
                    <CategoryIcon id={cat.id} />
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-foreground text-center leading-tight">
                    {cat.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
