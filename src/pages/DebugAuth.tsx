import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DebugAuth() {
  const [authStatus, setAuthStatus] = useState<any>({});
  const [profiles, setProfiles] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const checkAuth = async () => {
    setLoading(true);
    try {
      // Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // Check current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      setAuthStatus({
        hasSession: !!session,
        sessionData: session,
        hasUser: !!user,
        userData: user,
        sessionError: sessionError?.message,
        userError: userError?.message
      });

      // If we have a user, check their profile
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfiles([profileData]);
        } else {
          setError(`No profile found for user ${user.email}. Profile error: ${profileError?.message}`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const checkAllProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(10);

      if (error) {
        setError(`Error fetching profiles: ${error.message}`);
      } else {
        setProfiles(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testDirectLogin = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Testing login with ofir393@gmail.com...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'ofir393@gmail.com',
        password: 'qwerty',
      });

      console.log('Login response:', { data, error });

      if (error) {
        setError(`Login error: ${error.message}`);
        setAuthStatus({
          loginFailed: true,
          errorCode: error.message,
          possibleCauses: [
            'User needs email confirmation',
            'User not found in auth system',
            'Incorrect credentials',
            'Supabase auth settings blocking login'
          ]
        });
      } else {
        setAuthStatus({
          loginSuccess: true,
          userData: data.user,
          sessionData: data.session,
          userConfirmed: data.user?.email_confirmed_at ? true : false
        });
        
        // Check profile after login
        if (data.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', 'ofir393@gmail.com')
            .single();

          if (profileError) {
            setError(`Profile fetch error: ${profileError.message}`);
          } else {
            setProfiles([profileData]);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError(`Signout error: ${error.message}`);
    } else {
      setAuthStatus({});
      setProfiles([]);
    }
  };

  const createTestUser = async () => {
    setLoading(true);
    setError('');
    try {
      // Try signup instead of admin create
      const { data, error } = await supabase.auth.signUp({
        email: 'ofir393@gmail.com',
        password: 'qwerty',
        options: {
          emailRedirectTo: undefined // Skip email confirmation
        }
      });

      if (error) {
        setError(`Create user error: ${error.message}`);
      } else {
        setAuthStatus({ userCreated: true, newUser: data.user, session: data.session });
        
        // If signup successful and we have a user, create the profile
        if (data.user) {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: 'Test Manager',
              role: 'manager',
              plant_id: '223e4567-e89b-12d3-a456-426614174000',
              department_id: '423e4567-e89b-12d3-a456-426614174000'
            });

          if (profileError) {
            setError(`Profile creation error: ${profileError.message}`);
          } else {
            setAuthStatus(prev => ({
              ...prev,
              profileCreated: true
            }));
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Authentication Debug Panel</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Auth Status</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(authStatus, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Profiles in Database</CardTitle>
          </CardHeader>
          <CardContent>
            {profiles.length > 0 ? (
              <div className="space-y-2">
                {profiles.map((profile, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded">
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Name:</strong> {profile.full_name}</p>
                    <p><strong>Role:</strong> {profile.role}</p>
                    <p><strong>ID:</strong> {profile.id}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No profiles found</p>
            )}
          </CardContent>
        </Card>

        {error && (
          <Alert className="border-red-200">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button onClick={checkAuth} disabled={loading}>
                Check Auth Status
              </Button>
              <Button onClick={checkAllProfiles} disabled={loading}>
                List All Profiles
              </Button>
              <Button onClick={testDirectLogin} disabled={loading} variant="default">
                Test Login (ofir393@gmail.com)
              </Button>
              <Button onClick={signOut} disabled={loading} variant="outline">
                Sign Out
              </Button>
              <Button onClick={createTestUser} disabled={loading} variant="secondary">
                Try Create Test User
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Setup SQL</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              If the user exists but has no profile, run this SQL in Supabase:
            </p>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
{`-- First check if user exists
SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'ofir393@gmail.com';

-- If user exists but email_confirmed_at is NULL, confirm manually:
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'ofir393@gmail.com';

-- If user exists, copy the ID and run:
INSERT INTO user_profiles (id, email, full_name, role, plant_id, department_id) 
VALUES (
  'PASTE_USER_ID_HERE',
  'ofir393@gmail.com', 
  'Test Manager', 
  'manager',
  '223e4567-e89b-12d3-a456-426614174000',
  '423e4567-e89b-12d3-a456-426614174000'
) ON CONFLICT (id) DO UPDATE SET 
  role = 'manager',
  full_name = 'Test Manager';`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}