import React from 'react';
import FigmaIntegration from '@/components/FigmaIntegration';
import FigmaTokensShowcase from '@/components/FigmaTokensShowcase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, ExternalLink, Sparkles } from 'lucide-react';

const FigmaIntegrationDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Palette className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Figma Integration Demo</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect your Figma designs to extract design tokens, generate CSS custom properties, 
            and sync your design system with your codebase.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Access Token</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                ✅ Configured
              </Badge>
              <p className="text-xs text-gray-500 mt-2">From .env file</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">API Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                ✅ Connected
              </Badge>
              <p className="text-xs text-gray-500 mt-2">Figma API is working</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Database</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                ✅ Ready
              </Badge>
              <p className="text-xs text-gray-500 mt-2">Design tokens table exists</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Figma File</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                📁 Ofir's Team Library
              </Badge>
              <p className="text-xs text-gray-500 mt-2">File: kLjdmXN2Mf1AxU55cdPqQz</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Explore different parts of your application with Figma integration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <a
                href="/manager-figma"
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-sm">Manager Dashboard</span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
              <a
                href="https://www.figma.com/file/kLjdmXN2Mf1AxU55cdPqQz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-sm">View in Figma</span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
              <a
                href="/admin"
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-sm">Admin Dashboard</span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
              <a
                href="/"
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-sm">Home</span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="showcase" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="showcase">
              <Sparkles className="h-4 w-4 mr-2" />
              Your Design System
            </TabsTrigger>
            <TabsTrigger value="integration">
              <Palette className="h-4 w-4 mr-2" />
              Figma Integration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="showcase" className="mt-6">
            <FigmaTokensShowcase />
          </TabsContent>

          <TabsContent value="integration" className="mt-6">
            <FigmaIntegration 
              onTokensGenerated={(tokens) => {
                console.log('Generated tokens:', tokens);
              }}
              onComponentsExported={(components) => {
                console.log('Exported components:', components);
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FigmaIntegrationDemo;