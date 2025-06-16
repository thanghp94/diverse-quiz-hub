
import { useState, useEffect } from "react";
import { Search, User, LogOut, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

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
        
        <NavigationMenu>
          <NavigationMenuList className="flex items-center gap-1">
            {/* Bowl & Challenge Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-white hover:bg-white/20 data-[state=open]:bg-white/20">
                Bowl & Challenge
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-48 p-2">
                  <NavigationMenuLink 
                    className="block px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => setLocation('/topics?tab=overview-quiz')}
                  >
                    Overview Quiz
                  </NavigationMenuLink>
                  <NavigationMenuLink 
                    className="block px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => setLocation('/topics?tab=easy-quiz')}
                  >
                    Easy Quiz
                  </NavigationMenuLink>
                  <NavigationMenuLink 
                    className="block px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => setLocation('/topics?tab=hard-quiz')}
                  >
                    Hard Quiz
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Challenge Subject Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-white hover:bg-white/20 data-[state=open]:bg-white/20">
                Challenge Subject
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-48 p-2">
                  <NavigationMenuLink 
                    className="block px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => setLocation('/topics?subject=challenge&tab=overview-quiz')}
                  >
                    Overview Quiz
                  </NavigationMenuLink>
                  <NavigationMenuLink 
                    className="block px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => setLocation('/topics?subject=challenge&tab=easy-quiz')}
                  >
                    Easy Quiz
                  </NavigationMenuLink>
                  <NavigationMenuLink 
                    className="block px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => setLocation('/topics?subject=challenge&tab=hard-quiz')}
                  >
                    Hard Quiz
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Debate Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-white hover:bg-white/20 data-[state=open]:bg-white/20">
                Debate
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-48 p-2">
                  <NavigationMenuLink 
                    className="block px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => setLocation('/debate?tab=lesson')}
                  >
                    Debate Lesson
                  </NavigationMenuLink>
                  <NavigationMenuLink 
                    className="block px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => setLocation('/debate?tab=motions')}
                  >
                    Motions
                  </NavigationMenuLink>
                  <NavigationMenuLink 
                    className="block px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => setLocation('/debate?tab=assignment')}
                  >
                    Assignment
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Writing Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-white hover:bg-white/20 data-[state=open]:bg-white/20">
                Writing
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-48 p-2">
                  <NavigationMenuLink 
                    className="block px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => setLocation('/writing?tab=lesson')}
                  >
                    Writing Lesson
                  </NavigationMenuLink>
                  <NavigationMenuLink 
                    className="block px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => setLocation('/writing?tab=assignment')}
                  >
                    Assignment
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Leaderboard */}
            <NavigationMenuItem>
              <NavigationMenuLink 
                className="px-4 py-2 text-sm text-white hover:bg-white/20 rounded cursor-pointer"
                onClick={() => setLocation('/leaderboard')}
              >
                Leaderboard
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Matching */}
            <NavigationMenuItem>
              <NavigationMenuLink 
                className="px-4 py-2 text-sm text-white hover:bg-white/20 rounded cursor-pointer"
                onClick={() => setLocation('/matching')}
              >
                Matching
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
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
