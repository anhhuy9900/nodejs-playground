export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

interface HealthCheckResult {
  status: HealthStatus;
  checks: Record<string, { status: HealthStatus; message?: string }>;
}

export class HealthChecker {
  private checks = new Map<string, () => Promise<boolean>>();

  register(name: string, checkFn: () => Promise<boolean>): void {
    this.checks.set(name, checkFn);
  }

  async check(): Promise<HealthCheckResult> {
    const results: Record<string, { status: HealthStatus; message?: string }> = {};
    let overallStatus = HealthStatus.HEALTHY;

    for (const [name, checkFn] of this.checks.entries()) {
      try {
        const isHealthy = await checkFn();
        results[name] = {
          status: isHealthy ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
        };

        if (!isHealthy) {
          overallStatus = HealthStatus.UNHEALTHY;
        }
      } catch (error: any) {
        results[name] = {
          status: HealthStatus.UNHEALTHY,
          message: error.message,
        };
        overallStatus = HealthStatus.UNHEALTHY;
      }
    }

    return { status: overallStatus, checks: results };
  }
}
