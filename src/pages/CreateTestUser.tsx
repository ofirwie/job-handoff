import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CreateTestUser() {
  const [email, setEmail] = useState('ofir393@gmail.com');
  const [password, setPassword] = useState('qwerty');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const checkSupabaseConfig = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      if (error) {
        setError(`Supabase connection error: ${error.message}`);
        return;
      }

      setResult({
        connection: 'OK',
        supabaseUrl: supabase.supabaseUrl,
        message: 'Supabase connection working'
      });

    } catch (err) {
      setError(`Connection test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Check auth users (this might not work due to RLS)
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check user profiles
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('*');

      setResult({
        currentUser: user,
        profiles: profiles || [],
        profileError: profileError?.message
      });

    } catch (err) {
      setError(`Error checking users: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectSignup = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Try to sign up (this will create the user)
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined // Skip email confirmation
        }
      });

      if (signupError) {
        setError(`Signup error: ${signupError.message}`);
        return;
      }

      setResult({
        signupSuccess: true,
        user: signupData.user,
        session: signupData.session,
        message: 'User created successfully via signup'
      });

      // If signup successful and we have a user, create the profile
      if (signupData.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: signupData.user.id,
            email: signupData.user.email,
            full_name: 'Test Manager',
            role: 'manager',
            plant_id: '223e4567-e89b-12d3-a456-426614174000',
            department_id: '423e4567-e89b-12d3-a456-426614174000'
          });

        if (profileError) {
          setError(`Profile creation error: ${profileError.message}`);
        } else {
          setResult(prev => ({
            ...prev,
            profileCreated: true,
            message: 'User and profile created successfully!'
          }));
        }
      }

    } catch (err) {
      setError(`Signup failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(`Login error: ${error.message}`);
        return;
      }

      // Check if user has profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single();

      setResult({
        loginSuccess: true,
        user: data.user,
        session: data.session,
        profile: profile,
        profileError: profileError?.message,
        message: 'Login successful!'
      });

    } catch (err) {
      setError(`Login failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Create & Test User</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>User Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button onClick={checkSupabaseConfig} disabled={loading}>
                Test Supabase Connection
              </Button>
              <Button onClick={checkExistingUsers} disabled={loading}>
                Check Existing Users
              </Button>
              <Button onClick={testDirectSignup} disabled={loading} variant="default">
                Create User (Signup)
              </Button>
              <Button onClick={testLogin} disabled={loading} variant="secondary">
                Test Login
              </Button>
              <Button onClick={signOut} disabled={loading} variant="outline">
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert className="border-red-200">
            <AlertDescription className="text-red-800">
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><strong>Option 1:</strong> Click "Create User (Signup)" - This will create the user and profile automatically</p>
            <p><strong>Option 2:</strong> Create user manually in Supabase Dashboard, then click "Test Login"</p>
            <p><strong>After successful login:</strong> Go to <a href="/manager-enhanced" className="text-blue-600 underline">/manager-enhanced</a></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}