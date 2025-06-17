
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

import DebatePage from "./pages/Debate";
import WritingPage from "./pages/Writing";
import ChallengeSubject from "./pages/ChallengeSubject";
import Login from "./pages/Login";
import { DemoPage } from "./pages/DemoPage";
import LearningJourneyPage from "./pages/LearningJourneyPage";
import AssignmentPage from "./pages/AssignmentPage";
import { ContentGroupsPage } from "./pages/ContentGroupsPage";
import LiveClass from "./pages/LiveClass";

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
          <Route path="/challenge-subject" component={ChallengeSubject} />
          <Route path="/content/:id" component={Content} />
          <Route path="/leaderboard" component={Leaderboard} />

          <Route path="/debate" component={DebatePage} />
          <Route path="/writing" component={WritingPage} />
          <Route path="/learning-journey" component={LearningJourneyPage} />
          <Route path="/assignments" component={AssignmentPage} />
          <Route path="/content-groups" component={ContentGroupsPage} />
          <Route path="/live-class" component={LiveClass} />
          <Route path="/demo" component={DemoPage} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
