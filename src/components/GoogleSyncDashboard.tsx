import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  RefreshCw, 
  Calendar, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  Download,
  Activity
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SyncLog {
  id: string;
  sync_started_at: string;
  sync_completed_at: string | null;
  rows_processed: number;
  handovers_created: number;
  errors_count: number;
  error_details: string[] | null;
  status: 'running' | 'completed' | 'failed';
}

interface SyncStats {
  totalHandovers: number;
  activeHandovers: number;
  completedHandovers: number;
  overdueHandovers: number;
  lastSyncTime: string | null;
}

const GoogleSyncDashboard: React.FC = () => {
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch sync logs and statistics
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch recent sync logs
      const { data: logs, error: logsError } = await supabase
        .from('sheets_sync_log')
        .select('*')
        .order('sync_started_at', { ascending: false })
        .limit(10);

      if (logsError) throw logsError;

      // Fetch handover statistics
      const { data: handovers, error: handoversError } = await supabase
        .from('handovers')
        .select('status, departure_date, created_at');

      if (handoversError) throw handoversError;

      // Calculate statistics
      const now = new Date();
      const totalHandovers = handovers?.length || 0;
      const activeHandovers = handovers?.filter(h => 
        ['created', 'in_progress', 'completed'].includes(h.status)
      ).length || 0;
      const completedHandovers = handovers?.filter(h => h.status === 'approved').length || 0;
      const overdueHandovers = handovers?.filter(h => {
        if (!h.departure_date) return false;
        const departureDate = new Date(h.departure_date);
        return departureDate < now && !['approved', 'rejected'].includes(h.status);
      }).length || 0;

      const lastSuccessfulSync = logs?.find(log => log.status === 'completed');

      setSyncLogs(logs || []);
      setStats({
        totalHandovers,
        activeHandovers,
        completedHandovers,
        overdueHandovers,
        lastSyncTime: lastSuccessfulSync?.sync_completed_at || null
      });

    } catch (err) {
      console.error('Error fetching sync data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Trigger manual sync
  const triggerSync = async () => {
    try {
      setSyncing(true);
      setError(null);

      const response = await fetch('/api/sync/google-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.success) {
        // Refresh data after successful sync
        await fetchData();
      } else {
        setError(result.error || 'Sync failed');
      }

    } catch (err) {
      console.error('Sync error:', err);
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">הושלם</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">פועל</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">נכשל</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Google Sheets Sync Dashboard</h2>
          <div className="animate-spin">
            <RefreshCw className="h-5 w-5" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Google Sheets Sync Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={triggerSync}
            disabled={syncing}
            size="sm"
          >
            <Download className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Manual Sync'}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Handovers</p>
                  <p className="text-2xl font-bold">{stats.totalHandovers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.activeHandovers}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedHandovers}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdueHandovers}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Last Sync Info */}
      {stats?.lastSyncTime && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Last successful sync: {formatDate(stats.lastSyncTime)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sync Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {syncLogs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No sync logs found</p>
          ) : (
            <div className="space-y-4">
              {syncLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(log.status)}
                      <span className="text-sm text-gray-600">
                        {formatDate(log.sync_started_at)}
                      </span>
                    </div>
                    {log.sync_completed_at && (
                      <span className="text-xs text-gray-500">
                        Duration: {Math.round(
                          (new Date(log.sync_completed_at).getTime() - 
                           new Date(log.sync_started_at).getTime()) / 1000
                        )}s
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Processed:</span>
                      <span className="ml-1 font-medium">{log.rows_processed}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-1 font-medium text-green-600">{log.handovers_created}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Errors:</span>
                      <span className={`ml-1 font-medium ${log.errors_count > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {log.errors_count}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {log.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {log.status === 'failed' && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      {log.status === 'running' && (
                        <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                      )}
                    </div>
                  </div>

                  {log.error_details && log.error_details.length > 0 && (
                    <>
                      <Separator className="my-2" />
                      <div className="text-sm">
                        <p className="text-red-600 font-medium mb-1">Errors:</p>
                        <ul className="text-red-700 space-y-1">
                          {log.error_details.slice(0, 3).map((error, index) => (
                            <li key={index} className="text-xs">• {error}</li>
                          ))}
                          {log.error_details.length > 3 && (
                            <li className="text-xs text-gray-500">
                              ... and {log.error_details.length - 3} more errors
                            </li>
                          )}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEETS_ID}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Google Sheet
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://drive.google.com/drive/folders/${process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Drive Folder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleSyncDashboard;