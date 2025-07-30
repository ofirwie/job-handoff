import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DebugRouting = () => {
  const location = useLocation();
  const navigate = useNavigate();

  console.log('🐛 DebugRouting rendered');
  console.log('Location:', location);

  const testRoutes = [
    { path: '/', name: 'Home' },
    { path: '/handovers', name: 'Handovers' },
    { path: '/templates', name: 'Templates' },
    { path: '/debug', name: 'Debug (current)' }
  ];

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>🐛 Routing Debug Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Current Route Info:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify({
                pathname: location.pathname,
                search: location.search,
                hash: location.hash,
                href: window.location.href
              }, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold">Test Navigation:</h3>
            <div className="flex flex-wrap gap-2">
              {testRoutes.map(route => (
                <Button
                  key={route.path}
                  variant={location.pathname === route.path ? "default" : "outline"}
                  onClick={() => {
                    console.log('🔗 Navigating to:', route.path);
                    navigate(route.path);
                  }}
                >
                  {route.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Environment:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify({
                NODE_ENV: import.meta.env.NODE_ENV,
                MODE: import.meta.env.MODE,
                PROD: import.meta.env.PROD,
                BASE_URL: import.meta.env.BASE_URL,
                hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL
              }, null, 2)}
            </pre>
          </div>

          <div className="bg-yellow-50 p-3 rounded">
            <p className="text-sm">
              <strong>Debug Instructions:</strong><br/>
              1. Open browser dev tools (F12)<br/>
              2. Check console for routing logs<br/>
              3. Test navigation buttons above<br/>
              4. Check Network tab for 404 errors
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugRouting;