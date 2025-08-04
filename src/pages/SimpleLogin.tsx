import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function SimpleLogin() {
  const [email, setEmail] = useState('ofir393@gmail.com');
  const [password, setPassword] = useState('qwerty');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Login Successful",
        description: "Redirecting to manager dashboard...",
      });

      // Redirect to manager dashboard
      setTimeout(() => {
        navigate('/manager-enhanced');
      }, 1000);

    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user);
    
    if (user) {
      toast({
        title: "Already Logged In",
        description: `Logged in as: ${user.email}`,
      });
    } else {
      toast({
        title: "Not Logged In",
        description: "Please login to continue",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Manager Dashboard Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ofir393@gmail.com"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="test123456"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          
          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={checkCurrentUser}
              className="w-full"
            >
              Check Current User
            </Button>
          </div>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Test Credentials:</strong></p>
            <p>Email: ofir393@gmail.com</p>
            <p>Password: qwerty</p>
            <p className="text-xs text-gray-500">
              Make sure you've created this user in Supabase Authentication first!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}