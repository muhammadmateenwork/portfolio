import { NextResponse } from "next/server";
import { connectDB, isConnected, isMongoConfigured } from "@/lib/mongodb";

export async function GET() {
  const configured = isMongoConfigured();
  let connected = false;
  let error: string | null = null;

  if (configured) {
    try {
      await connectDB();
      connected = isConnected();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      error = errMsg;

      // Categorize the error for user-friendly messages
      if (errMsg.includes("whitelist") || errMsg.includes("IP")) {
        error = "IP_NOT_WHITELISTED";
      } else if (errMsg.includes("authentication") || errMsg.includes("auth")) {
        error = "AUTH_FAILED";
      } else if (errMsg.includes("timed out") || errMsg.includes("Timeout")) {
        error = "CONNECTION_TIMEOUT";
      } else if (errMsg.includes("ECONNREFUSED")) {
        error = "CONNECTION_REFUSED";
      } else if (errMsg.includes("unavailable") || errMsg.includes("Skipping")) {
        error = "RETRY_COOLDOWN";
      }
    }
  } else {
    error = "NOT_CONFIGURED";
  }

  return NextResponse.json({
    configured,
    connected,
    error,
    status: connected ? "connected" : configured ? "error" : "not_configured",
  });
}
