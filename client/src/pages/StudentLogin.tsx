import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Mail, User } from "lucide-react";

export default function StudentLogin() {
  const [loginMethod, setLoginMethod] = useState<"initial" | "email">("initial");
  const [identifier, setIdentifier] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInitialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast({
        title: "Error", 
        description: "Please enter your Student ID or Meraki Email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/student-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.needsPersonalEmail) {
          setLoginMethod("email");
          toast({
            title: "Account Setup",
            description: "Please provide your personal email for future logins",
          });
        } else {
          toast({
            title: "Success",
            description: "Login successful! Redirecting...",
          });
          window.location.href = "/";
        }
      } else {
        toast({
          title: "Login Failed",
          description: result.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Connection error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter your personal email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/email-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: personalEmail.trim() }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Login successful! Redirecting...",
        });
        window.location.href = "/";
      } else {
        const error = await response.json();
        toast({
          title: "Login Failed",
          description: error.message || "Email not found",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Connection error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPersonalEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter your personal email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/set-personal-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          identifier: identifier.trim(),
          personalEmail: personalEmail.trim() 
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Email saved! Login successful! Redirecting...",
        });
        window.location.href = "/";
      } else {
        const error = await response.json();
        toast({
          title: "Setup Failed",
          description: error.message || "Failed to save email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Connection error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loginMethod === "email") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Mail className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Setup Google Login</CardTitle>
            <CardDescription>
              Link your Google account for easy future access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetPersonalEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="personalEmail">Your Google Email</Label>
                <Input
                  id="personalEmail"
                  type="email"
                  placeholder="Enter your Google email"
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  This will be used for Google authentication in future logins
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Setting up..." : "Setup Google Login"}
              </Button>
            </form>
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setLoginMethod("initial")}
              >
                Back to Student ID Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <CardContent className="space-y-4">
          <form onSubmit={handleInitialLogin} className="space-y-4">
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
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              <User className="h-4 w-4 mr-2" />
              {isLoading ? "Verifying..." : "Login with Student ID"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="googleEmail">Google Email (Returning Students)</Label>
              <Input
                id="googleEmail"
                type="email"
                placeholder="Enter your Google email"
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              variant="outline"
              className="w-full" 
              disabled={isLoading || !personalEmail.trim()}
            >
              <Mail className="h-4 w-4 mr-2" />
              {isLoading ? "Signing In..." : "Login with Google Email"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>First time? Use your Student ID or Meraki Email above.</p>
            <p className="mt-1">Returning students can use their Google email.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}