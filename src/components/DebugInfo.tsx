import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const DebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDebug = async () => {
      const info: any = {
        timestamp: new Date().toISOString(),
        environment: {
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          anonKeyPreview: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
        },
        connection: null,
        tables: {}
      };

      // Test connection
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .limit(1);

        if (error) {
          info.connection = {
            status: 'error',
            message: error.message,
            code: error.code,
            details: error.details
          };
        } else {
          info.connection = {
            status: 'success',
            message: `Connected successfully. Found ${data.length} organizations.`,
            sampleData: data
          };
        }
      } catch (err: any) {
        info.connection = {
          status: 'error',
          message: err.message
        };
      }

      // Test tables
      const tables = ['organizations', 'plants', 'departments', 'jobs', 'categories', 'templates', 'handovers'];
      
      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

          if (error) {
            info.tables[table] = { status: 'error', message: error.message };
          } else {
            info.tables[table] = { status: 'success', count };
          }
        } catch (err: any) {
          info.tables[table] = { status: 'error', message: err.message };
        }
      }

      setDebugInfo(info);
      setLoading(false);
    };

    runDebug();
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading debug information...</p>
        </CardContent>
      </Card>
    );
  }

  const envOk = debugInfo.environment.supabaseUrl && debugInfo.environment.hasAnonKey;
  const connectionOk = debugInfo.connection?.status === 'success';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {envOk ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
            Environment Variables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            <p>VITE_SUPABASE_URL: {debugInfo.environment.supabaseUrl || 'NOT SET'}</p>
            <p>VITE_SUPABASE_ANON_KEY: {debugInfo.environment.hasAnonKey ? debugInfo.environment.anonKeyPreview : 'NOT SET'}</p>
          </div>
          {!envOk && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Environment variables are missing! This will cause the white screen.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {connectionOk ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
            Database Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {debugInfo.connection ? (
            <div className="space-y-2">
              <p className="font-medium">Status: {debugInfo.connection.status}</p>
              <p className="text-sm text-muted-foreground">{debugInfo.connection.message}</p>
              {debugInfo.connection.code && <p className="text-sm text-red-600">Code: {debugInfo.connection.code}</p>}
              {debugInfo.connection.details && <p className="text-sm text-red-600">Details: {debugInfo.connection.details}</p>}
              {debugInfo.connection.sampleData && (
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(debugInfo.connection.sampleData, null, 2)}
                </pre>
              )}
            </div>
          ) : (
            <p>No connection information available</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(debugInfo.tables).map(([table, info]: [string, any]) => (
              <div key={table} className="flex items-center justify-between p-2 border rounded">
                <span className="font-medium">{table}</span>
                <div className="flex items-center gap-2">
                  {info.status === 'success' ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-muted-foreground">{info.count} records</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">{info.message}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Debug Mode Active</strong> - This component shows diagnostic information to help resolve the white screen issue.
          Generated at: {debugInfo.timestamp}
        </AlertDescription>
      </Alert>
    </div>
  );
};