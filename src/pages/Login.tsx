import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Validation schemas
const emailSchema = z.string().trim().email({ message: "Invalid email address" });
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" });

export default function Login() {
  // Signup is disabled — accounts are created manually by admins.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if already logged in
  useEffect(() => {
    // Check if user is already logged in with JWT
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('user');
      if (token && user) {
        navigate("/admin");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== LOGIN FORM SUBMITTED ===');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    console.log('API_URL available:', !!(import.meta as any).env.VITE_API_URL);
    
    setLoading(true);

    try {
      // Validate inputs
      console.log('Validating inputs...');
      emailSchema.parse(email);
      passwordSchema.parse(password);
      console.log('Input validation passed');

      // Use our backend API for authentication
      const API_URL = (import.meta as any).env.VITE_API_URL as string | undefined;
      console.log('API_URL:', API_URL);
      if (!API_URL) {
        throw new Error("API_URL is not configured");
      }

      console.log('Making API call to:', `${API_URL.replace(/\/$/, "")}/auth/login`);
      const res = await fetch(`${API_URL.replace(/\/$/, "")}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', res.status);

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        console.log('Login error response:', body);
        throw new Error(body?.error || res.statusText);
      }

      const { token, user } = await res.json();
      console.log('Login successful, received token and user');

      // Store the token in localStorage for future requests
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });

      // Navigate to admin page
      console.log('Navigating to /admin');
      navigate("/admin");
    } catch (error) {
      console.error('=== LOGIN ERROR ===', error);
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
          description: error instanceof Error ? error.message : "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="text-4xl font-bold text-primary">UnionHub</div>
          </div>
          <CardTitle className="text-2xl text-center">Welcome back!</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required 
              />
              <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
            </div>
            <Button className="w-full" type="submit" disabled={loading} onClick={() => console.log('Button clicked!')}>
              {loading ? "Please wait..." : "Sign In"}
            </Button>
          </form>
          <div className="text-center text-sm">
            <p>
              If you don't have an account, please contact an administrator to create one for you.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
