import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Download, 
  RefreshCw, 
  Palette, 
  Code, 
  Eye, 
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy
} from 'lucide-react';
import { getOfirFigmaService } from '@/services/figmaService';
import type { FigmaDesignToken } from '@/services/figmaService';

interface FigmaIntegrationProps {
  fileKey?: string;
  onTokensGenerated?: (tokens: FigmaDesignToken[]) => void;
  onComponentsExported?: (components: string[]) => void;
}

const FigmaIntegration: React.FC<FigmaIntegrationProps> = ({
  fileKey = 'kLjdmXN2Mf1AxU55cdPqQz',
  onTokensGenerated,
  onComponentsExported
}) => {
  const [designTokens, setDesignTokens] = useState<FigmaDesignToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState(import.meta.env.VITE_FIGMA_ACCESS_TOKEN || '');
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [generatedCSS, setGeneratedCSS] = useState('');
  const [generatedTailwind, setGeneratedTailwind] = useState('');

  // Load stored design tokens on mount
  useEffect(() => {
    loadStoredTokens();
  }, []);

  const loadStoredTokens = async () => {
    try {
      const figmaService = getOfirFigmaService();
      const storedTokens = await figmaService.getStoredDesignTokens();
      setDesignTokens(storedTokens);
    } catch (err) {
      console.error('Error loading stored tokens:', err);
    }
  };

  const generateTokens = async () => {
    if (!accessToken.trim()) {
      setError('Figma access token not found in environment variables. Please set VITE_FIGMA_ACCESS_TOKEN.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create service instance with access token
      const figmaService = new (await import('@/services/figmaService')).default(fileKey, accessToken);
      
      // Generate design tokens
      const tokens = await figmaService.generateDesignTokens();
      setDesignTokens(tokens);

      // Sync to database
      await figmaService.syncDesignTokensToSupabase(tokens);

      // Generate CSS and Tailwind config
      const css = figmaService.generateCSSCustomProperties(tokens);
      const tailwindConfig = figmaService.generateTailwindConfig(tokens);
      
      setGeneratedCSS(css);
      setGeneratedTailwind(JSON.stringify(tailwindConfig, null, 2));

      setSuccess(`Successfully generated ${tokens.length} design tokens from Figma!`);
      onTokensGenerated?.(tokens);
    } catch (err: any) {
      setError(err.message || 'Failed to generate design tokens');
    } finally {
      setLoading(false);
    }
  };

  const exportComponents = async () => {
    if (!accessToken.trim()) {
      setError('Figma access token not found in environment variables. Please set VITE_FIGMA_ACCESS_TOKEN.');
      return;
    }

    if (selectedNodes.length === 0) {
      setError('Please provide node IDs to export');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const figmaService = new (await import('@/services/figmaService')).default(fileKey, accessToken);
      const componentUrls = await figmaService.exportComponents(selectedNodes);
      
      setSuccess(`Successfully exported ${componentUrls.length} components!`);
      onComponentsExported?.(componentUrls);
    } catch (err: any) {
      setError(err.message || 'Failed to export components');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(null), 2000);
  };

  const getTokensByType = (type: string) => {
    return designTokens.filter(token => token.type === type);
  };

  const renderTokenPreview = (token: FigmaDesignToken) => {
    switch (token.type) {
      case 'color':
        return (
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded border border-gray-300" 
              style={{ backgroundColor: token.value }}
            />
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">{token.value}</code>
          </div>
        );
      case 'border':
        return (
          <div 
            className="w-8 h-8 bg-gray-200 border-2 border-gray-400"
            style={{ borderRadius: `${token.value}px` }}
          />
        );
      case 'shadow':
        return (
          <div 
            className="w-8 h-8 bg-white border border-gray-300"
            style={{ boxShadow: token.value as string }}
          />
        );
      default:
        return <code className="text-sm bg-gray-100 px-2 py-1 rounded">{token.value}</code>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Figma Integration
          </CardTitle>
          <CardDescription>
            Connect to your Figma designs and sync design tokens with your job handoff system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="access-token">Figma Access Token</Label>
              <Input
                id="access-token"
                type="password"
                placeholder={accessToken ? "Token configured ✓" : "No token found"}
                value={accessToken ? "••••••••••••••••••••••••••••••••••••••••••••••••" : ""}
                readOnly
                className={accessToken ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}
              />
              <p className="text-sm mt-1">
                {accessToken ? (
                  <span className="text-green-600">✓ Token loaded from environment variables</span>
                ) : (
                  <span className="text-red-600">
                    ✗ Token not found. Set VITE_FIGMA_ACCESS_TOKEN in your .env file.
                  </span>
                )}
              </p>
            </div>
            <div>
              <Label htmlFor="file-key">Figma File Key</Label>
              <Input
                id="file-key"
                value={fileKey}
                readOnly
                className="bg-gray-50"
              />
              <p className="text-sm text-gray-500 mt-1">
                From your Figma file URL
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button 
          onClick={generateTokens} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Generate Design Tokens
        </Button>
        
        <Button 
          variant="outline" 
          onClick={loadStoredTokens}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Load Stored Tokens
        </Button>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tokens" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tokens">Design Tokens</TabsTrigger>
          <TabsTrigger value="export">Export Components</TabsTrigger>
          <TabsTrigger value="css">Generated CSS</TabsTrigger>
          <TabsTrigger value="config">Tailwind Config</TabsTrigger>
        </TabsList>

        {/* Design Tokens Tab */}
        <TabsContent value="tokens" className="space-y-4">
          {designTokens.length > 0 ? (
            <div className="space-y-4">
              {/* Token Summary */}
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">
                  Colors: {getTokensByType('color').length}
                </Badge>
                <Badge variant="secondary">
                  Spacing: {getTokensByType('spacing').length}
                </Badge>
                <Badge variant="secondary">
                  Borders: {getTokensByType('border').length}
                </Badge>
                <Badge variant="secondary">
                  Shadows: {getTokensByType('shadow').length}
                </Badge>
              </div>

              {/* Tokens Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {designTokens.map((token, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {token.type}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm">{token.name}</h4>
                        {renderTokenPreview(token)}
                        {token.description && (
                          <p className="text-xs text-gray-500">{token.description}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Palette className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No Design Tokens Found</h3>
                <p className="text-gray-500 text-center mb-4">
                  Generate design tokens from your Figma file to see them here.
                </p>
                <Button onClick={generateTokens} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  Generate Tokens
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Export Components Tab */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Components</CardTitle>
              <CardDescription>
                Export specific Figma components as SVG files for use in your project.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="node-ids">Node IDs (comma-separated)</Label>
                <Textarea
                  id="node-ids"
                  placeholder="Enter Figma node IDs, e.g., 123:456, 789:012"
                  value={selectedNodes.join(', ')}
                  onChange={(e) => setSelectedNodes(e.target.value.split(',').map(id => id.trim()).filter(Boolean))}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Right-click on elements in Figma and select "Copy/Paste as" → "Copy link" to get node IDs
                </p>
              </div>
              
              <Button 
                onClick={exportComponents} 
                disabled={loading || selectedNodes.length === 0}
                className="flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Export Components
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generated CSS Tab */}
        <TabsContent value="css" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated CSS Custom Properties</CardTitle>
                  <CardDescription>
                    CSS custom properties generated from your Figma design tokens.
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(generatedCSS)}
                  disabled={!generatedCSS}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {generatedCSS ? (
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{generatedCSS}</code>
                </pre>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Code className="h-12 w-12 mx-auto mb-4" />
                  <p>Generate design tokens first to see CSS output</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tailwind Config Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Tailwind Config</CardTitle>
                  <CardDescription>
                    Tailwind CSS configuration extension based on your Figma design tokens.
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(generatedTailwind)}
                  disabled={!generatedTailwind}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {generatedTailwind ? (
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{generatedTailwind}</code>
                </pre>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-4" />
                  <p>Generate design tokens first to see Tailwind config</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FigmaIntegration;