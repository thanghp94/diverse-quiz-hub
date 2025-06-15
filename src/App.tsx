
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Topics from "./pages/Topics";
import Content from "./pages/Content";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import MatchingListPage from "./pages/MatchingList";
import MatchingActivityPage from "./pages/MatchingActivity";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/content/:id" element={<Content />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/matching" element={<MatchingListPage />} />
          <Route path="/matching/:id" element={<MatchingActivityPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
