import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ManagerDashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Manager Dashboard Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ 
          padding: '40px', 
          backgroundColor: '#fff', 
          minHeight: '100vh',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ 
            maxWidth: '600px', 
            margin: '0 auto',
            textAlign: 'center' as const
          }}>
            <div style={{ 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '32px',
              marginBottom: '24px'
            }}>
              <AlertTriangle 
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  color: '#ef4444',
                  margin: '0 auto 16px auto'
                }} 
              />
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '600', 
                color: '#dc2626',
                marginBottom: '12px'
              }}>
                Manager Dashboard Error
              </h2>
              <p style={{ 
                color: '#7f1d1d', 
                marginBottom: '20px',
                lineHeight: '1.5'
              }}>
                The Manager Dashboard encountered an error while loading. This might be due to a network issue, 
                missing data, or a temporary problem.
              </p>
              
              <button
                onClick={this.handleRetry}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              >
                <RefreshCw style={{ width: '16px', height: '16px' }} />
                Try Again
              </button>
            </div>

            {/* Debug Info (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ 
                backgroundColor: '#f8f9fa', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'left' as const,
                fontSize: '14px',
                fontFamily: 'monospace'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '12px' }}>
                  🔍 Debug Information (Click to expand)
                </summary>
                <div style={{ marginTop: '12px' }}>
                  <strong>Error:</strong>
                  <pre style={{ 
                    backgroundColor: '#fee2e2', 
                    padding: '12px', 
                    borderRadius: '4px',
                    margin: '8px 0',
                    fontSize: '12px',
                    overflow: 'auto'
                  }}>
                    {this.state.error.toString()}
                  </pre>
                  
                  {this.state.error.stack && (
                    <>
                      <strong>Stack Trace:</strong>
                      <pre style={{ 
                        backgroundColor: '#f3f4f6', 
                        padding: '12px', 
                        borderRadius: '4px',
                        margin: '8px 0',
                        fontSize: '12px',
                        overflow: 'auto',
                        maxHeight: '200px'
                      }}>
                        {this.state.error.stack}
                      </pre>
                    </>
                  )}
                  
                  {this.state.errorInfo && (
                    <>
                      <strong>Component Stack:</strong>
                      <pre style={{ 
                        backgroundColor: '#f3f4f6', 
                        padding: '12px', 
                        borderRadius: '4px',
                        margin: '8px 0',
                        fontSize: '12px',
                        overflow: 'auto',
                        maxHeight: '200px'
                      }}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}

            {/* Quick Actions */}
            <div style={{ 
              marginTop: '32px',
              padding: '24px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: '#374151'
              }}>
                Quick Actions
              </h3>
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'center',
                flexWrap: 'wrap' as const
              }}>
                <a 
                  href="/" 
                  style={{ 
                    color: '#2563eb', 
                    textDecoration: 'none',
                    padding: '8px 16px',
                    border: '1px solid #2563eb',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  ← Go to Home
                </a>
                <a 
                  href="/employee" 
                  style={{ 
                    color: '#2563eb', 
                    textDecoration: 'none',
                    padding: '8px 16px',
                    border: '1px solid #2563eb',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  Employee Dashboard
                </a>
                <a 
                  href="/admin" 
                  style={{ 
                    color: '#2563eb', 
                    textDecoration: 'none',
                    padding: '8px 16px',
                    border: '1px solid #2563eb',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  Admin Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ManagerDashboardErrorBoundary;