
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import Index from "./pages/Index";
import Topics from "./pages/Topics";
import Content from "./pages/Content";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import MatchingListPage from "./pages/MatchingList";
import MatchingActivityPage from "./pages/MatchingActivity";
import DebatePage from "./pages/Debate";
import WritingPage from "./pages/Writing";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/" component={Topics} />
          <Route path="/topics" component={Topics} />
          <Route path="/content/:id" component={Content} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/matching" component={MatchingListPage} />
          <Route path="/matching/:id" component={MatchingActivityPage} />
          <Route path="/debate" component={DebatePage} />
          <Route path="/writing" component={WritingPage} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
