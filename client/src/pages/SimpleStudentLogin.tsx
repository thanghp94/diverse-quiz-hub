import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, User, Lock } from "lucide-react";

export default function SimpleStudentLogin() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("Meraki123");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier.trim()) {
      toast({
        title: "Required Field",
        description: "Please enter your Student ID or Meraki Email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          identifier: identifier.trim(),
          password: password
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Login Successful!",
          description: "Welcome to the platform",
        });
        
        // Wait briefly for session to be saved, then redirect
        setTimeout(() => {
          if (result.needsEmailSetup) {
            window.location.href = "/setup-email";
          } else {
            window.location.href = "/";
          }
        }, 500);
      } else {
        toast({
          title: "Login Failed", 
          description: result.message || "Invalid Student ID/Email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Student Login</CardTitle>
          <CardDescription>
            Enter your Student ID or Meraki Email to access learning materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Student ID or Meraki Email</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Enter Student ID or Meraki Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="text-center"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-center"
              />
              <p className="text-xs text-gray-500 text-center">
                Default password: Meraki123
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              <User className="h-4 w-4 mr-2" />
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>First time? Use your Student ID with default password.</p>
            <p className="mt-1">You'll be prompted to set up your personal email.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}