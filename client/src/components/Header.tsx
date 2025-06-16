
import { useState, useEffect } from "react";
import { Search, User, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { StreakDisplay } from "./StreakDisplay";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setLocation("/login");
  };

  const handleLogin = () => {
    setLocation("/login");
  };

  return (
    <header className="bg-purple-600 text-white px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <span className="text-purple-600 font-bold text-sm">M</span>
          </div>
          <h1 className="text-xl font-semibold">Meraki WSC</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setLocation('/')}
            className="text-white hover:text-white/80 transition-colors"
          >
            Bowl & Challenge
          </button>
          <button 
            onClick={() => setLocation('/challenge-subject')}
            className="text-white hover:text-white/80 transition-colors"
          >
            Challenge Subject
          </button>
          <button 
            onClick={() => setLocation('/debate')}
            className="text-white hover:text-white/80 transition-colors"
          >
            Debate
          </button>
          <button 
            onClick={() => setLocation('/writing')}
            className="text-white hover:text-white/80 transition-colors"
          >
            Writing
          </button>
          <button 
            onClick={() => setLocation('/learning-journey')}
            className="text-white hover:text-white/80 transition-colors"
          >
            Learning Journey
          </button>
          <button 
            onClick={() => setLocation('/assignments')}
            className="text-white hover:text-white/80 transition-colors"
          >
            Assignments
          </button>
          <button 
            onClick={() => setLocation('/leaderboard')}
            className="text-white hover:text-white/80 transition-colors"
          >
            Leaderboard
          </button>
          
        </div>

        <div className="flex items-center gap-4">
          {currentUser && (
            <StreakDisplay 
              studentId={currentUser.id} 
              className="text-white/90 bg-white/10 px-3 py-1 rounded-full"
            />
          )}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search Home"
              className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/70 focus:bg-white/30"
            />
          </div>

          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-white/20 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {currentUser.full_name || currentUser.first_name || currentUser.id}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {currentUser.full_name || `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim()}
                </div>
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  {currentUser.category} • {currentUser.id}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" onClick={handleLogin} className="text-white hover:bg-white/20">
              <User className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
