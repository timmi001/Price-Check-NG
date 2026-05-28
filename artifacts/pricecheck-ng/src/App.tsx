import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import SearchPage from "@/pages/Search";
import ProductDetail from "@/pages/ProductDetail";
import Deals from "@/pages/Deals";
import Categories from "@/pages/Categories";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <>
      <Navbar />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/search" component={SearchPage} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route path="/deals" component={Deals} />
          <Route path="/categories" component={Categories} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="pricecheck-ng-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
