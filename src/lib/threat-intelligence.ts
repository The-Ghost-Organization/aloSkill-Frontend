import type { NextRequest } from "next/server";

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  isp: string;
}

export interface IPReputation {
  riskScore: number;
  isProxy: boolean;
  isVPN: boolean;
  isTor: boolean;
  isHosting: boolean;
  threatTypes: string[];
  confidence: number;
}

export class ThreatIntelligence {
  private maliciousIPs = new Set<string>();
  private ipCache = new Map<string, { data: any; timestamp: number }>();
  private CACHE_DURATION = 5 * 60 * 1000;

  async checkGeoLocation(
    request: NextRequest
  ): Promise<{ allowed: boolean; reason?: string; location?: GeoLocation }> {
    const clientIP = this.getClientIP(request);

    // Get geo location
    const location = await this.getIPLocation(clientIP);

    // Check for restricted regions
    const restrictedRegions = await this.getRestrictedRegions();
    if (restrictedRegions.includes(location.country)) {
      return {
        allowed: false,
        reason: "region_restricted",
        location,
      };
    }

    // Check for high-risk countries
    const highRiskCountries = await this.getHighRiskCountries();
    if (highRiskCountries.includes(location.country)) {
      return {
        allowed: true,
        reason: "high_risk_region",
        location,
      };
    }

    return { allowed: true, location };
  }

  async checkIPReputation(ip: string): Promise<IPReputation> {
    // Check cache first
    const cached = this.ipCache.get(ip);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    let riskScore = 0;
    const threatTypes: string[] = [];
    const isProxy = false;
    let isVPN = false;
    let isTor = false;
    let isHosting = false;

    // Check internal blacklist
    if (this.maliciousIPs.has(ip)) {
      riskScore += 80;
      threatTypes.push("blacklisted");
    }

    // Check for known VPN/proxy ranges
    if (await this.isVPN(ip)) {
      riskScore += 40;
      isVPN = true;
      threatTypes.push("vpn");
    }

    // Check for hosting providers
    if (await this.isHostingProvider(ip)) {
      riskScore += 20;
      isHosting = true;
      threatTypes.push("hosting");
    }

    // Check for TOR exit nodes
    if (await this.isTorNode(ip)) {
      riskScore += 60;
      isTor = true;
      threatTypes.push("tor");
    }

    // Check for recent abusive behavior
    const recentAbuse = await this.checkRecentAbuse(ip);
    if (recentAbuse.detected) {
      riskScore += recentAbuse.score;
      threatTypes.push(...recentAbuse.types);
    }

    // Normalize risk score
    riskScore = Math.min(100, riskScore);

    const result: IPReputation = {
      riskScore,
      isProxy: isVPN || isTor,
      isVPN,
      isTor,
      isHosting,
      threatTypes,
      confidence: this.calculateConfidence(riskScore, threatTypes.length),
    };

    // Cache the result
    this.ipCache.set(ip, {
      data: result,
      timestamp: Date.now(),
    });

    return result;
  }

  async banIP(ip: string, reason: string, duration: number = 24 * 60 * 60 * 1000) {
    this.maliciousIPs.add(ip);

    // console.log(`IP Banned: ${ip} for reason: ${reason} for ${duration}ms`);

    // Auto-remove after duration
    setTimeout(() => {
      this.maliciousIPs.delete(ip);
    }, duration);
  }

  async getSuspiciousActivity(): Promise<{ ip: string; reason: string; timestamp: Date }[]> {
    // Return recent suspicious activity
    return Array.from(this.maliciousIPs).map(ip => ({
      ip,
      reason: "manual_ban",
      timestamp: new Date(),
    }));
  }

  // Private methods
  private async getIPLocation(ip: string): Promise<GeoLocation> {
    // In production, use a service like:
    // - IPAPI
    // - MaxMind GeoIP2
    // - IP2Location

    // Mock implementation
    return {
      country: "US",
      region: "California",
      city: "San Francisco",
      isp: "Cloudflare",
    };
  }

  private async getRestrictedRegions(): Promise<string[]> {
    // Return list of restricted country codes
    return ["CU", "IR", "KP", "SY", "RU"]; // Example restricted countries
  }

  private async getHighRiskCountries(): Promise<string[]> {
    // Return list of high-risk country codes
    return ["CN", "RU", "BR", "IN", "NG"]; // Example high-risk countries
  }

  private async isVPN(ip: string): Promise<boolean> {
    // Check against known VPN IP ranges
    // Implement with VPN detection service
    return false;
  }

  private async isHostingProvider(ip: string): Promise<boolean> {
    // Check if IP belongs to hosting provider
    // Implement with hosting detection
    return ip.startsWith("192.0.2."); // Example
  }

  private async isTorNode(ip: string): Promise<boolean> {
    // Check against TOR exit node list
    // Implement with TOR detection
    return false;
  }

  private async checkRecentAbuse(
    ip: string
  ): Promise<{ detected: boolean; score: number; types: string[] }> {
    // Check internal abuse records
    // Implement with your abuse tracking
    return { detected: false, score: 0, types: [] };
  }

  private calculateConfidence(riskScore: number, threatCount: number): number {
    let confidence = riskScore;

    // More threats = higher confidence
    if (threatCount > 1) {
      confidence += 10 * (threatCount - 1);
    }

    // Very high risk scores get confidence boost
    if (riskScore > 80) {
      confidence += 10;
    }

    return Math.min(100, confidence);
  }

  private getClientIP(request: NextRequest): string {
    return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  }

  // Utility methods for monitoring
  getStats() {
    return {
      totalBannedIPs: this.maliciousIPs.size,
      cacheSize: this.ipCache.size,
      cacheHitRate: this.calculateCacheHitRate(),
    };
  }

  private calculateCacheHitRate(): number {
    // Implement cache hit rate calculation
    return 0.85; // Example
  }

  // Clear cache (useful for testing)
  clearCache() {
    this.ipCache.clear();
  }
}

export const threatIntelligence = new ThreatIntelligence();
