import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Database, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";

type TestConnectionResult = {
  success: boolean;
  error?: string;
  results?: {
    database?: {
      status?: string;
      host?: string;
      user?: string;
      database?: string;
      error?: string;
    };
  };
};

type Details = {
  dbHost?: string;
  dbUser?: string;
  dbName?: string;
  error?: string;
  egressIp?: string;
  reason?: string;
  action?: string;
};

function analyzeError(err: string): { reason: string; action: string } | null {
  const msg = (err || "").toLowerCase();
  if (!msg) return null;

  if (msg.includes("access denied for user") || msg.includes("er_access_denied_error")) {
    return {
      reason: "Authentication or host allowlist issue",
      action:
        "Verify DB user/password and allowlist the server egress IP on the database host. Ensure the user has CONNECT privileges for this host.",
    };
  }
  if (msg.includes("enotfound") || msg.includes("getaddrinfo enotfound") || msg.includes("hostname not found")) {
    return {
      reason: "Invalid hostname or DNS resolution failure",
      action: "Check DB_HOST value, DNS settings, or use the database server's IP address.",
    };
  }
  if (msg.includes("econnrefused") || msg.includes("connection refused")) {
    return {
      reason: "Port closed or database service not accepting connections",
      action:
        "Ensure the DB server is running, port is correct and open in the firewall/security group, and network rules allow inbound from this server.",
    };
  }
  if (msg.includes("etimedout") || msg.includes("timeout")) {
    return {
      reason: "Network timeout",
      action: "Allowlist the server IP, verify firewall/VPC rules, and confirm the host/port are correct.",
    };
  }
  if (msg.includes("ssl") || msg.includes("certificate") || msg.includes("handshake")) {
    return {
      reason: "SSL/TLS configuration mismatch",
      action:
        "Enable SSL on the DB or adjust client SSL settings (set DB_SSL appropriately). Ensure certificates are valid.",
    };
  }
  return {
    reason: "Unknown connection error",
    action: "Review the error details below and database server logs for more information.",
  };
}

const DatabaseStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [details, setDetails] = useState<Details>({});

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch("/api/test/connection");
        let result: TestConnectionResult = { success: false };
        try {
          result = await response.json();
        } catch {}
        const dbOk =
          result?.results?.database?.status === "connected" ||
          result?.success === true;
        setIsConnected(true);
        setDbConnected(!!dbOk);

        if (!dbOk) {
          const host = result?.results?.database?.host;
          const user = result?.results?.database?.user;
          const dbName = result?.results?.database?.database;
          const errMsg = result?.error || result?.results?.database?.error;
          const analysis = analyzeError(errMsg || "");

          try {
            const ipRes = await fetch("/api/test/egress-ip");
            const ipJson = await ipRes.json();
            setDetails({
              dbHost: host,
              dbUser: user,
              dbName,
              error: errMsg || undefined,
              egressIp: ipJson?.ip || undefined,
              reason: analysis?.reason,
              action: analysis?.action,
            });
          } catch {
            setDetails({
              dbHost: host,
              dbUser: user,
              dbName,
              error: errMsg || undefined,
              reason: analysis?.reason,
              action: analysis?.action,
            });
          }
        } else {
          setDetails({});
        }
      } catch (error) {
        setIsConnected(false);
        setDbConnected(null);
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
      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-700">
          <div className="space-y-2">
            <p>Live database not connected. Please try again shortly or contact support.</p>
            {details.dbHost && (
              <p className="text-xs">Database host: <span className="font-medium">{details.dbHost}</span></p>
            )}
            {details.dbUser && (
              <p className="text-xs">Database user: <span className="font-medium">{details.dbUser}</span></p>
            )}
            {details.dbName && (
              <p className="text-xs">Database name: <span className="font-medium">{details.dbName}</span></p>
            )}
            {details.egressIp && (
              <p className="text-xs">Server egress IP: <span className="font-medium">{details.egressIp}</span> (add to your DB allowlist)</p>
            )}
            {details.error && (
              <p className="text-xs">Issue: {details.error}</p>
            )}
            {details.reason && (
              <p className="text-xs">Reason: {details.reason}</p>
            )}
            {details.action && (
              <p className="text-xs">Suggested fix: {details.action}</p>
            )}
            <div className="flex items-center space-x-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/api/test/connection", "_blank")}
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
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
    <Alert className="border-orange-200 bg-orange-50">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-700">
        <div className="space-y-3">
          <p className="font-medium">⚠️ API not reachable</p>
          <p className="text-sm">Please refresh the page or try again shortly.</p>
          <div className="flex items-center space-x-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("/api/test/connection", "_blank")}
              className="text-orange-700 border-orange-300 hover:bg-orange-100"
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
