import React from 'react';
import EnhancedManagerDashboardComponent from '@/components/EnhancedManagerDashboard';
import { useCurrentUserProfile } from '@/hooks/useManagerDashboardSupabase';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function EnhancedManagerDashboardPage() {
  const { profile, loading, error } = useCurrentUserProfile();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#2d7ef8]" />
          <span className="text-[#42526e]">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600 mb-4">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Authentication Error</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {error}
            </p>
            <p className="text-xs text-gray-500">
              Please make sure you're logged in and have manager permissions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-yellow-600 mb-4">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Profile Not Found</span>
            </div>
            <p className="text-sm text-gray-600">
              No user profile found. Please contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user has manager permissions
  if (!['manager', 'admin', 'hr'].includes(profile.role)) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600 mb-4">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Access Denied</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              You don't have manager permissions to access this dashboard.
            </p>
            <p className="text-xs text-gray-500">
              Current role: <span className="font-medium">{profile.role}</span>
            </p>
            <p className="text-xs text-gray-500">
              Required roles: Manager, Admin, or HR
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <EnhancedManagerDashboardComponent
      managerEmail={profile.email}
      managerName={profile.full_name || profile.email}
      department={profile.departments?.name}
    />
  );
}