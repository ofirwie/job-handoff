import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Palette, Type, Circle } from 'lucide-react';

const FigmaTokensShowcase: React.FC = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const colorTokens = [
    { name: 'Primary Blue', css: '--figma-primary-blue-fill-0', value: '#2663eb' },
    { name: 'Secondary Purple', css: '--figma-secondary-purple-fill-0', value: '#7d3bed' },
    { name: 'Success Green', css: '--figma-success-green-fill-0', value: '#0fba82' },
    { name: 'Warning Orange', css: '--figma-warning-orange-fill-0', value: '#f59e0a' },
    { name: 'Danger Red', css: '--figma-danger-red-fill-0', value: '#f04545' },
    { name: 'Main Title', css: '--figma-main-title-fill-0', value: '#1a1a33' },
  ];

  const buttonTokens = [
    { name: 'Primary Button', bg: 'var(--figma-primary-button-fill-0)', text: 'var(--figma-button-text-fill-0)' },
    { name: 'Success Button', bg: 'var(--figma-success-button-fill-0)', text: 'var(--figma-button-text-fill-0)' },
    { name: 'Warning Button', bg: 'var(--figma-warning-button-fill-0)', text: 'var(--figma-button-text-fill-0)' },
    { name: 'Danger Button', bg: 'var(--figma-danger-button-fill-0)', text: 'var(--figma-button-text-fill-0)' },
  ];

  const taskCardStyle = {
    backgroundColor: 'var(--figma-task-card-component-fill-0)',
    border: '1px solid var(--figma-task-card-component-stroke-0)',
    borderRadius: 'var(--figma-task-card-component-border-radius)px',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--figma-main-title-fill-0)' }}>
          Your Figma Design System
        </h2>
        <p className="text-gray-600">
          Live design tokens extracted from your Figma file: <strong>771 tokens</strong> found!
        </p>
      </div>

      {/* Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Palette
          </CardTitle>
          <CardDescription>Colors extracted from your Figma designs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {colorTokens.map((token, index) => (
              <div key={index} className="text-center space-y-2">
                <div 
                  className="w-full h-16 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  style={{ backgroundColor: token.value }}
                  onClick={() => copyToClipboard(`var(${token.css})`)}
                />
                <div>
                  <p className="font-medium text-sm">{token.name}</p>
                  <p className="text-xs text-gray-500">{token.value}</p>
                  <button 
                    className="text-xs text-blue-500 hover:underline"
                    onClick={() => copyToClipboard(`var(${token.css})`)}
                  >
                    Copy CSS
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Button Styles */}
      <Card>
        <CardHeader>
          <CardTitle>Button Styles from Figma</CardTitle>
          <CardDescription>Button components using your extracted design tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {buttonTokens.map((button, index) => (
              <button
                key={index}
                className="px-4 py-2 rounded font-semibold transition-opacity hover:opacity-90"
                style={{ 
                  backgroundColor: button.bg, 
                  color: button.text,
                  borderRadius: 'var(--figma-primary-button-border-radius)px'
                }}
              >
                {button.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Card Example */}
      <Card>
        <CardHeader>
          <CardTitle>Task Card Component</CardTitle>
          <CardDescription>Using extracted card styling tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4" style={taskCardStyle}>
              <div className="flex items-center justify-between mb-3">
                <Badge 
                  className="px-2 py-1 text-xs font-semibold rounded"
                  style={{ 
                    backgroundColor: 'var(--figma-status-badge-fill-0)',
                    color: 'var(--figma-status-text-fill-0)',
                    borderRadius: 'var(--figma-status-badge-border-radius)px'
                  }}
                >
                  In Progress
                </Badge>
                <span className="text-xs" style={{ color: 'var(--figma-due-date-fill-0)' }}>
                  Due: Aug 15, 2025
                </span>
              </div>
              <h3 
                className="font-bold text-lg mb-2"
                style={{ color: 'var(--figma-task-title-fill-0)' }}
              >
                Complete Design System Integration
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'var(--figma-task-description-fill-0)' }}
              >
                Implement the extracted Figma design tokens across all components in the job handoff system.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Typography System
          </CardTitle>
          <CardDescription>Text styles from your Figma file</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h1 style={{ 
                color: 'var(--figma-main-title-fill-0)',
                font: 'var(--figma-main-title-typography)'
              }}>
                Main Title Style
              </h1>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                font: var(--figma-main-title-typography)
              </code>
            </div>
            
            <div>
              <h3 style={{ 
                color: 'var(--figma-task-title-fill-0)',
                font: 'var(--figma-task-title-typography)'
              }}>
                Task Title Style
              </h3>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                font: var(--figma-task-title-typography)
              </code>
            </div>

            <div>
              <span style={{ 
                color: 'var(--figma-button-text-fill-0)',
                font: 'var(--figma-button-text-typography)'
              }}>
                Button Text Style
              </span>
              <br />
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                font: var(--figma-button-text-typography)
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Guide */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use These Tokens</CardTitle>
          <CardDescription>Copy these examples to use your Figma design tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">CSS Usage:</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`.my-component {
  background-color: var(--figma-primary-blue-fill-0);
  color: var(--figma-button-text-fill-0);
  border-radius: var(--figma-primary-button-border-radius)px;
  font: var(--figma-button-text-typography);
}`}</pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">React Inline Styles:</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<div style={{
  backgroundColor: 'var(--figma-primary-blue-fill-0)',
  color: 'var(--figma-button-text-fill-0)',
  borderRadius: 'var(--figma-primary-button-border-radius)px'
}}>
  My Component
</div>`}</pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Tailwind CSS (with custom config):</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<div className="bg-figma-primary text-figma-button-text rounded-figma-button">
  My Component
</div>`}</pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FigmaTokensShowcase;