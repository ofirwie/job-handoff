import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Settings as SettingsIcon, 
  Cloud, 
  Database, 
  Key, 
  CheckCircle, 
  AlertTriangle,
  Info,
  ExternalLink,
  Copy,
  RefreshCw,
  FileText,
  FolderOpen,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import GoogleSyncDashboard from '@/components/GoogleSyncDashboard';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  details?: string;
}

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('google');
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    {
      id: 'database',
      title: 'Database Schema',
      description: 'Create job_roles table and update schema for Google integration',
      status: 'pending'
    },
    {
      id: 'service_account',
      title: 'Google Service Account',
      description: 'Create service account and download credentials',
      status: 'pending'
    },
    {
      id: 'sheets',
      title: 'Google Sheets Setup',
      description: 'Create spreadsheet with proper headers and sharing',
      status: 'pending'
    },
    {
      id: 'drive',
      title: 'Google Drive Setup',
      description: 'Create parent folder and set permissions',
      status: 'pending'
    },
    {
      id: 'env_vars',
      title: 'Environment Variables',
      description: 'Configure all required environment variables',
      status: 'pending'
    },
    {
      id: 'test',
      title: 'Test Connection',
      description: 'Verify Google services integration',
      status: 'pending'
    }
  ]);

  const [envVars, setEnvVars] = useState({
    GOOGLE_SERVICE_ACCOUNT_KEY: '',
    GOOGLE_SHEETS_ID: '',
    GOOGLE_DRIVE_PARENT_FOLDER_ID: '',
    CRON_SECRET: '',
    SUPABASE_SERVICE_ROLE_KEY: ''
  });

  const [testResults, setTestResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  // Run database migration
  const runDatabaseMigration = async () => {
    updateStepStatus('database', 'in_progress');
    
    try {
      // In a real implementation, this would run the SQL migration
      // For now, we'll show the SQL that needs to be run
      const migrationSQL = `-- Copy and run this SQL in your Supabase SQL editor
-- Google Integration Schema from database/04_google_integration_schema.sql

-- Please open the file database/04_google_integration_schema.sql
-- and copy its contents to run in Supabase`;
      
      updateStepStatus('database', 'completed', 'Schema ready for manual execution in Supabase');
      
      // Show SQL in a modal or copy to clipboard
      navigator.clipboard.writeText(migrationSQL);
      alert('Database migration SQL copied to clipboard. Please run it in Supabase SQL editor.');
      
    } catch (error) {
      updateStepStatus('database', 'error', error instanceof Error ? error.message : 'Migration failed');
    }
  };

  // Update step status
  const updateStepStatus = (stepId: string, status: SetupStep['status'], details?: string) => {
    setSetupSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, details } : step
    ));
  };

  // Generate cron secret
  const generateCronSecret = () => {
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setEnvVars(prev => ({ ...prev, CRON_SECRET: secret }));
  };

  // Test Google connection
  const testGoogleConnection = async () => {
    setTesting(true);
    updateStepStatus('test', 'in_progress');
    
    try {
      // Test configuration status
      const response = await fetch('/api/test/google-connection', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      setTestResults(result);
      
      // Update individual step statuses based on test results
      if (result.setupSteps) {
        if (result.setupSteps.database) {
          updateStepStatus('database', 'completed', 'Database configured');
        }
        if (result.setupSteps.serviceAccount) {
          updateStepStatus('service_account', 'completed', `Service account: ${result.environment.serviceAccountEmail}`);
        }
        if (result.setupSteps.sheets) {
          updateStepStatus('sheets', 'completed', 'Google Sheets ID configured');
        }
        if (result.setupSteps.drive) {
          updateStepStatus('drive', 'completed', 'Google Drive folder configured');
        }
        if (result.setupSteps.cron) {
          updateStepStatus('env_vars', 'completed', 'Environment variables set');
        }
      }
      
      if (result.status === 'ready') {
        updateStepStatus('test', 'completed', 'All Google services are configured and ready');
      } else {
        updateStepStatus('test', 'error', 'Some configuration steps are incomplete');
      }
      
    } catch (error) {
      updateStepStatus('test', 'error', error instanceof Error ? error.message : 'Test failed');
      setTestResults({
        error: error instanceof Error ? error.message : 'Test failed',
        success: false
      });
    } finally {
      setTesting(false);
    }
  };

  // Get step icon
  const getStepIcon = (status: SetupStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'in_progress':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="rounded-full"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-semibold flex items-center gap-2">
                <SettingsIcon className="h-6 w-6" />
                Settings
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="google">Google Integration</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          {/* Google Integration Tab */}
          <TabsContent value="google" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Google Services Setup Wizard</CardTitle>
                <CardDescription>
                  Complete these steps to enable Google Sheets and Drive integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Setup Steps */}
                <div className="space-y-4">
                  {setupSteps.map((step) => (
                    <div key={step.id} className="flex items-start gap-3 p-4 rounded-lg border">
                      {getStepIcon(step.status)}
                      <div className="flex-1">
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                        {step.details && (
                          <p className="text-sm mt-1 text-blue-600">{step.details}</p>
                        )}
                      </div>
                      
                      {/* Step Actions */}
                      {step.id === 'database' && step.status === 'pending' && (
                        <Button size="sm" onClick={runDatabaseMigration}>
                          Run Migration
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Environment Variables */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Environment Variables</h3>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      These variables should be set in your Vercel dashboard for production
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="service_account">Google Service Account Key (JSON)</Label>
                      <Textarea
                        id="service_account"
                        placeholder='{"type":"service_account","project_id":"..."}'
                        value={envVars.GOOGLE_SERVICE_ACCOUNT_KEY}
                        onChange={(e) => setEnvVars(prev => ({
                          ...prev,
                          GOOGLE_SERVICE_ACCOUNT_KEY: e.target.value
                        }))}
                        className="font-mono text-xs"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sheets_id">Google Sheets ID</Label>
                        <Input
                          id="sheets_id"
                          placeholder="1a2b3c4d5e6f..."
                          value={envVars.GOOGLE_SHEETS_ID}
                          onChange={(e) => setEnvVars(prev => ({
                            ...prev,
                            GOOGLE_SHEETS_ID: e.target.value
                          }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="drive_folder">Google Drive Parent Folder ID</Label>
                        <Input
                          id="drive_folder"
                          placeholder="1x2y3z4a5b6c..."
                          value={envVars.GOOGLE_DRIVE_PARENT_FOLDER_ID}
                          onChange={(e) => setEnvVars(prev => ({
                            ...prev,
                            GOOGLE_DRIVE_PARENT_FOLDER_ID: e.target.value
                          }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cron_secret">Cron Secret</Label>
                      <div className="flex gap-2">
                        <Input
                          id="cron_secret"
                          placeholder="Generate a secure random string"
                          value={envVars.CRON_SECRET}
                          onChange={(e) => setEnvVars(prev => ({
                            ...prev,
                            CRON_SECRET: e.target.value
                          }))}
                        />
                        <Button onClick={generateCronSecret} variant="outline">
                          Generate
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="supabase_key">Supabase Service Role Key</Label>
                      <Input
                        id="supabase_key"
                        type="password"
                        placeholder="eyJ..."
                        value={envVars.SUPABASE_SERVICE_ROLE_KEY}
                        onChange={(e) => setEnvVars(prev => ({
                          ...prev,
                          SUPABASE_SERVICE_ROLE_KEY: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const envText = Object.entries(envVars)
                          .map(([key, value]) => `${key}=${value}`)
                          .join('\n');
                        copyToClipboard(envText, 'Environment variables');
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All Variables
                    </Button>

                    <Button
                      onClick={testGoogleConnection}
                      disabled={testing || !envVars.GOOGLE_SERVICE_ACCOUNT_KEY}
                    >
                      {testing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        'Test Connection'
                      )}
                    </Button>
                  </div>
                </div>

                {/* Test Results */}
                {testResults && (
                  <Alert className={testResults.status === 'ready' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
                    <div className="flex items-start gap-2">
                      {testResults.status === 'ready' ? (
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <AlertDescription>
                          <p className={`font-medium mb-2 ${testResults.status === 'ready' ? 'text-green-800' : 'text-yellow-800'}`}>
                            {testResults.message}
                          </p>
                          {testResults.environment && (
                            <div className="text-sm space-y-1">
                              <p>Service Account: {testResults.environment.serviceAccountEmail || 'Not configured'}</p>
                              <p>Sheets ID: {testResults.googleApis?.sheets?.sheetsId || 'Not configured'}</p>
                              <p>Drive Folder: {testResults.googleApis?.drive?.parentFolderId || 'Not configured'}</p>
                            </div>
                          )}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                )}

                <Separator />

                {/* Quick Links */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Links & Resources</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => window.open('https://console.cloud.google.com', '_blank')}
                    >
                      <Cloud className="h-4 w-4 mr-2" />
                      Google Cloud Console
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open('https://sheets.new', '_blank')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Create Google Sheet
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open('https://drive.google.com', '_blank')}
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Google Drive
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Supabase Dashboard
                    </Button>
                  </div>
                </div>

                {/* Documentation */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium mb-2">Setup Documentation</p>
                    <div className="space-y-1">
                      <p className="text-sm">• Detailed setup guide: <code>GOOGLE_SETUP.md</code></p>
                      <p className="text-sm">• Deployment guide: <code>DEPLOYMENT_GOOGLE_INTEGRATION.md</code></p>
                      <p className="text-sm">• SQL migration: <code>database/04_google_integration_schema.sql</code></p>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring">
            <GoogleSyncDashboard />
          </TabsContent>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Environment</p>
                    <p className="font-medium">Production</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Version</p>
                    <p className="font-medium">1.0.0</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Database</p>
                    <p className="font-medium">Supabase (PostgreSQL)</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Deployment</p>
                    <p className="font-medium">Vercel</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Codes Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge>HR001 - Human Resources</Badge>
                  <Badge>DEV002 - Development</Badge>
                  <Badge>MKT003 - Marketing</Badge>
                  <Badge>FIN004 - Finance</Badge>
                  <Badge>IT005 - IT Systems</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;