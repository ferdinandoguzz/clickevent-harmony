
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Login: React.FC = () => {
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = (location.state as { from?: string })?.from || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Use the existing login function to maintain app state management
      await login(email, password);
      
      toast({
        title: "Successfully logged in",
        description: `Welcome back!`
      });
      
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : 'An error occurred during login',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    setIsSubmitting(true);
    try {
      let demoEmail = '';
      
      if (role === 'superadmin') {
        demoEmail = 'superadmin@clickevent.com';
      } else if (role === 'admin') {
        demoEmail = 'admin@clickevent.com';
      } else if (role === 'staff') {
        demoEmail = 'staff@clickevent.com';
      }
      
      // For demo purposes, we'll use a standard password
      const demoPassword = 'password';
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword
      });
      
      if (error) throw error;
      
      // Use the existing login function to maintain app state management
      await login(demoEmail, demoPassword);
      
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Demo login error:', error);
      toast({
        title: "Demo login failed",
        description: "Could not log in with demo account. Please try again or contact support.",
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-md animate-in">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">VIPList</h1>
          <p className="text-muted-foreground">Event management made simple</p>
        </div>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Account Login</CardTitle>
            <CardDescription>
              Sign in to access the application
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button type="button" variant="link" className="p-0 h-auto text-xs">
                    Forgot password?
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex-col gap-2">
            <div className="text-xs text-muted-foreground mb-2 text-center w-full">
              Demo accounts for prototype:
            </div>
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-xs" 
                onClick={() => handleDemoLogin('superadmin')}
                disabled={isSubmitting}
              >
                Super Admin
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-xs" 
                onClick={() => handleDemoLogin('admin')}
                disabled={isSubmitting}
              >
                Admin
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-xs" 
                onClick={() => handleDemoLogin('staff')}
                disabled={isSubmitting}
              >
                Staff
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
