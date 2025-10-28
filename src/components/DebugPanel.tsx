import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Database, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DebugPanelProps {
  onClose: () => void;
}

export default function DebugPanel({ onClose }: DebugPanelProps) {
  const [sqliteStatus, setSqliteStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [errorDetails, setErrorDetails] = useState<string>('');

  useEffect(() => {
    checkSqliteStatus();
  }, []);

  const checkSqliteStatus = async () => {
    try {
      // Check if window.sqlite exists
      if (typeof window !== 'undefined' && 'sqlite' in window) {
        console.log("✅ window.sqlite found:", window.sqlite);
        
        // Try to test a simple operation
        try {
          await window.sqlite.queryData({
            query: "SELECT 1 as test",
            params: []
          });
          console.log("✅ SQLite query test successful");
          setSqliteStatus('available');
        } catch (queryError) {
          console.error("❌ SQLite query test failed:", queryError);
          setErrorDetails(`Query test failed: ${queryError instanceof Error ? queryError.message : 'Unknown error'}`);
          setSqliteStatus('unavailable');
        }
      } else {
        console.log("❌ window.sqlite not found");
        setErrorDetails('window.sqlite object is not available in the current environment');
        setSqliteStatus('unavailable');
      }
    } catch (error) {
      console.error("❌ SQLite status check failed:", error);
      setErrorDetails(`Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSqliteStatus('unavailable');
    }
  };

  const testDatabaseOperations = async () => {
    try {
      console.log("🧪 Testing database operations...");
      
      // Test table creation
      await window.sqlite.createTable({
        tableName: "test_todos",
        schema: `
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          completed BOOLEAN DEFAULT 0
        `
      });
      console.log("✅ Test table created");

      // Test data insertion
      const result = await window.sqlite.insertData({
        tableName: "test_todos",
        data: {
          title: "Test Task",
          completed: 0
        }
      });
      console.log("✅ Test data inserted, ID:", result.id);

      // Test data query
      const queryResult = await window.sqlite.queryData({
        query: "SELECT * FROM test_todos WHERE id = ?",
        params: [result.id]
      });
      console.log("✅ Test data queried:", queryResult);

      // Cleanup
      await window.sqlite.deleteData({
        tableName: "test_todos",
        where: { id: result.id }
      });
      console.log("✅ Test data cleaned up");

      alert("All database operations successful! ✅");
    } catch (error) {
      console.error("❌ Database test failed:", error);
      alert(`Database test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Server className="w-5 h-5" />
              SQLite MCP Server Debug Panel
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          <div className="space-y-4">
            {/* SQLite Status */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Database className="w-4 h-4" />
                SQLite MCP Server Status
              </h3>
              
              {sqliteStatus === 'checking' && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Checking SQLite MCP server availability...
                </div>
              )}

              {sqliteStatus === 'available' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    ✅ SQLite MCP server is available and working
                  </div>
                  <Button onClick={testDatabaseOperations} size="sm">
                    Test Database Operations
                  </Button>
                </div>
              )}

              {sqliteStatus === 'unavailable' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    ❌ SQLite MCP server is not available
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-800 font-medium">Error Details:</p>
                    <p className="text-sm text-red-700 mt-1">{errorDetails}</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-sm text-yellow-800 font-medium">Troubleshooting:</p>
                    <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                      <li>• Ensure SQLite MCP server is running</li>
                      <li>• Check browser console for detailed error logs</li>
                      <li>• App will use localStorage as fallback</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Environment Info */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Environment Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">window.sqlite:</span>
                  <span className={typeof window !== 'undefined' && 'sqlite' in window ? 'text-green-600' : 'text-red-600'}>
                    {typeof window !== 'undefined' && 'sqlite' in window ? 'Available' : 'Not Available'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SQLite Status:</span>
                  <span className={sqliteStatus === 'available' ? 'text-green-600' : 'text-yellow-600'}>
                    {sqliteStatus === 'available' ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Storage Mode:</span>
                  <span className={sqliteStatus === 'available' ? 'text-green-600' : 'text-yellow-600'}>
                    {sqliteStatus === 'available' ? 'SQLite Database' : 'LocalStorage Fallback'}
                  </span>
                </div>
              </div>
            </div>

            {/* Console Instructions */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-3">Debug Instructions</h3>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Open browser developer console (F12)</li>
                <li>Check for "SQLite MCP server available" messages</li>
                <li>Look for any red error messages</li>
                <li>Try running: <code className="bg-gray-200 px-1 rounded">window.sqlite</code> in console</li>
              </ol>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}