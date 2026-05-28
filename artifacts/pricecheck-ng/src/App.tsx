import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import UserProfile from "@/pages/UserProfile";
import SellerUpgrade from "@/pages/SellerUpgrade";
import SellerDashboard from "@/pages/SellerDashboard";
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
          <Route path="/">
            <Redirect to="/profile" />
          </Route>
          <Route path="/profile" component={UserProfile} />
          <Route path="/seller-upgrade" component={SellerUpgrade} />
          <Route path="/seller-dashboard" component={SellerDashboard} />
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
