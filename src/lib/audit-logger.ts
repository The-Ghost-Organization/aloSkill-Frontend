
import { config } from "@/config/env.ts";
import type { NextRequest } from "next/server";

export interface AuditLog {
  id: string;
  timestamp: Date;
  ip: string;
  userAgent: string;
  path: string;
  method: string;
  userId?: string | undefined;
  userRole?: string | undefined;
  action: string;
  details: unknown;
  riskLevel?: "low" | "medium" | "high" | "critical" | undefined;
  responseStatus: number;
  processingTime: number;
}

export class AuditLogger {
  private logs: AuditLog[] = [];
  private maxLogs = 10000;

  async startAudit(request: NextRequest): Promise<string> {
    const auditId = this.generateAuditId();

    const initialLog: Partial<AuditLog> = {
      id: auditId,
      timestamp: new Date(),
      ip: this.getClientIP(request),
      userAgent: request.headers.get("user-agent") || "unknown",
      path: request.nextUrl.pathname,
      method: request.method,
      action: "request_started",
      details: {
        headers: this.sanitizeHeaders(request.headers),
        searchParams: Object.fromEntries(request.nextUrl.searchParams),
      },
      riskLevel: "low",
    };

    this.addLog(initialLog as AuditLog);
    return auditId;
  }

  async logThreat(auditId: string, threatType: string, details: any) {
    this.updateLog(auditId, {
      action: `threat_detected_${threatType}`,
      riskLevel: "high",
      details: { ...details, threatType },
    });
  }

  async logAccessViolation(auditId: string, request: NextRequest, token: any, details: unknown) {
    this.updateLog(auditId, {
      action: "access_violation",
      riskLevel: "medium",
      userId: token?.["id"] as string,
      userRole: token?.["role"] as string,
      details,
    });
  }

  async logSuccess(auditId: string, request: NextRequest, token: any) {
    this.updateLog(auditId, {
      action: "request_completed",
      riskLevel: "low",
      userId: token?.["id"] as string,
      userRole: token?.["role"] as string,
      responseStatus: 200,
      processingTime: Date.now() - (this.getLog(auditId) as AuditLog)?.timestamp.getTime() || 0,
    });
  }

  async logError(auditId: string, error: any, _request: NextRequest) {
    this.updateLog(auditId, {
      action: "security_error",
      riskLevel: "high",
      details: {
        error: error["message"],
        stack: config.NODE_ENV === "development" ? error["stack"] : undefined,
      },
      responseStatus: 500,
    });
  }

  // Analytics methods
  getThreatStats(timeframe: "1h" | "24h" | "7d") {
    const cutoff = this.getCutoffDate(timeframe);
    const relevantLogs = this.logs.filter(log => log.timestamp > cutoff);

    const threats = relevantLogs.filter(
      log => log.riskLevel === "high" || log.riskLevel === "critical"
    );
    const byType = this.groupBy(threats, "action");
    const byIP = this.groupBy(threats, "ip");

    return {
      totalThreats: threats.length,
      threatsByType: byType,
      topMaliciousIPs: Object.entries(byIP)
        .sort(([, a], [, b]) => b.length - a.length)
        .slice(0, 10),
      riskDistribution: this.groupBy(threats, "riskLevel"),
    };
  }

  getSuspiciousActivity() {
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    return this.logs.filter(
      log => log.timestamp > lastHour && (log.riskLevel === "high" || log.riskLevel === "critical")
    );
  }

  // Private methods
  private addLog(log: AuditLog) {
    this.logs.push(log);

    // Maintain log size limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  private updateLog(auditId: string, updates: Partial<AuditLog>) {
    const logIndex = this.logs.findIndex(log => log.id === auditId);
    if (logIndex !== -1) {
      this.logs[logIndex] = { ...this.logs[logIndex], ...updates } as AuditLog;
    }
  }

  private getLog(auditId: string): AuditLog | undefined {
    return this.logs.find(log => log.id === auditId);
  }

  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClientIP(request: NextRequest): string {
    return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  }

  private sanitizeHeaders(headers: Headers): Record<string, string> {
    const sanitized: Record<string, string> = {};
    const sensitiveHeaders = ["authorization", "cookie", "x-auth-token"];

    for (const [key, value] of headers.entries()) {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = "***REDACTED***";
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private getCutoffDate(timeframe: "1h" | "24h" | "7d"): Date {
    const now = Date.now();
    const cutoffs = {
      "1h": now - 60 * 60 * 1000,
      "24h": now - 24 * 60 * 60 * 1000,
      "7d": now - 7 * 24 * 60 * 60 * 1000,
    };

    return new Date(cutoffs[timeframe]);
  }

  private groupBy(array: any[], key: string): any[] {
    return array.reduce((groups, item) => {
      const group = item[key] || "unknown";
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }

  // Export logs for external analysis
  exportLogs(): AuditLog[] {
    return [...this.logs];
  }

  // Clear logs (useful for testing)
  clearLogs() {
    this.logs = [];
  }
}

export const auditLogger = new AuditLogger();

// For production, you might want to use:
/*
class DatabaseAuditLogger extends AuditLogger {
  // Implement database storage instead of memory
}
*/
