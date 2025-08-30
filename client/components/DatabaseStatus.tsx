import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Database, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";

const DatabaseStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reason, setReason] = useState<string>("");
  const [egressIp, setEgressIp] = useState<string>("");
  const [dbHost, setDbHost] = useState<string>("");

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch("/api/test/connection");
        let result: any = {};
        try {
          result = await response.json();
        } catch {}
        const dbOk =
          result?.results?.database?.status === "connected" ||
          result?.success === true;
        // API reachable
        setIsConnected(true);
        setDbConnected(!!dbOk);
        const host = result?.results?.database?.host || "";
        const err = result?.error || result?.results?.database?.error || "";
        if (!dbOk) {
          setDbHost(String(host || ""));
          if (err) setReason(String(err));
          try {
            const ipRes = await fetch("/api/test/egress-ip");
            const ipJson = await ipRes.json().catch(() => ({}) as any);
            if (ipJson?.ip) setEgressIp(String(ipJson.ip));
          } catch {}
        }
      } catch (error: any) {
        // API unreachable
        setIsConnected(false);
        setDbConnected(null);
        setReason(String(error?.message || "API unreachable"));
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  if (isLoading) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Database className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          Checking database connection...
        </AlertDescription>
      </Alert>
    );
  }

  if (isConnected && dbConnected) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          ✅ Database connected successfully! Authentication is ready.
        </AlertDescription>
      </Alert>
    );
  }

  if (isConnected && dbConnected === false) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          <div className="space-y-2">
            <p className="font-medium">Live database not connected.</p>
            {dbHost && (
              <p className="text-sm">
                DB Host: <span className="font-mono">{dbHost}</span>
              </p>
            )}
            {reason && <p className="text-sm">Reason: {reason}</p>}
            {egressIp && (
              <p className="text-sm">
                Current server IP: <span className="font-mono">{egressIp}</span>
              </p>
            )}
            {!egressIp && (
              <p className="text-sm">Current server IP: detecting...</p>
            )}
            <div className="flex items-center space-x-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/api/test/connection", "_blank")}
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                API Status
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-red-200 bg-red-50">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-700">
        <div className="space-y-3">
          <p className="font-medium">⚠️ API not reachable</p>
          {reason && <p className="text-sm">Reason: {reason}</p>}
          <p className="text-sm">
            Please refresh the page or try again shortly.
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("/api/test/connection", "_blank")}
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              API Status
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default DatabaseStatus;
