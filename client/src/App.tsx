import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router as WouterRouter, Route, Switch } from "wouter";
import { useAuth } from "@/hooks/useAuth";

// Lazy load all page components
const SimpleStudentLogin = lazy(() => import("./pages/SimpleStudentLogin"));
const SetupEmail = lazy(() => import("./pages/SetupEmail"));
const Topics = lazy(() => import("./pages/Topics"));
const Content = lazy(() => import("./pages/Content"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DebatePage = lazy(() => import("./pages/DebatePage"));
const WritingPage = lazy(() => import("./pages/WritingPage"));
const ChallengeSubject = lazy(() => import("./pages/ChallengeSubject"));
const Login = lazy(() => import("./pages/Login"));
const DemoPage = lazy(() => import("./pages/DemoPage"));
const AssignmentPage = lazy(() => import("./pages/AssignmentPage"));
const LiveClass = lazy(() => import("./pages/LiveClass"));
const LiveClassPage = lazy(() => import("./pages/LiveClassPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      queryFn: async ({ queryKey }) => {
        let url = queryKey[0] as string;
        
        // Handle live class activities with query parameters
        if (url === '/api/live-class-activities' && queryKey.length > 1) {
          const [, studentIds, startTime] = queryKey;
          if (studentIds && startTime) {
            const params = new URLSearchParams({
              studentIds: Array.isArray(studentIds) ? studentIds.join(',') : String(studentIds),
              startTime: String(startTime)
            });
            url = `${url}?${params.toString()}`;
          }
        }
        
        const response = await fetch(url, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        
        return response.json();
      },
    },
  },
});

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <Switch>
        <Route path="/setup-email" component={SetupEmail} />
        {!isAuthenticated ? (
          <Route path="/" component={SimpleStudentLogin} />
        ) : (
          <>
            <Route path="/" component={Topics} />
            <Route path="/topics" component={Topics} />
            <Route path="/challenge-subject" component={ChallengeSubject} />
            <Route path="/content/:id" component={Content} />
            <Route path="/leaderboard" component={Leaderboard} />
            <Route path="/debate" component={DebatePage} />
            <Route path="/writing" component={WritingPage} />
            <Route path="/assignments" component={AssignmentPage} />
            <Route path="/live-class" component={LiveClass} />
            <Route path="/live-monitor" component={LiveClassPage} />
            <Route path="/admin" component={AdminPage} />
            <Route path="/demo" component={DemoPage} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <WouterRouter>
        <AppRouter />
      </WouterRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
