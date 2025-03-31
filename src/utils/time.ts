type TimeUnit = "s" | "m" | "h" | "d";

export function parseTimeToSeconds(timeString: string): number {
  if (!timeString) {
    throw new Error("timeString is underfined.");
  }

  // Validate input format
  const regex = /^(\d+)([smhd])$/;
  const match = timeString.match(regex);

  if (!timeString || !match) {
    throw new Error("Invalid time format. Use format like: 60s, 2m, 24h, 7d");
  }

  const [, valueStr, unit] = match;
  const value = parseInt(valueStr, 10);

  // Validate the numeric value
  if (value <= 0) {
    throw new Error("Time value must be positive");
  }

  const multipliers: Record<TimeUnit, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };

  const seconds = value * multipliers[unit as TimeUnit];

  // Optional: Add maximum limit
  const MAX_SECONDS = 365 * 24 * 60 * 60; // 1 year
  if (seconds > MAX_SECONDS) {
    throw new Error("Time duration too long");
  }

  return seconds;
}

// Add a function to convert seconds back to human readable format
export function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

// Helper function to create JWT payload with expiration
export function createJWTPayload(data: Record<string, any>, expiresIn: string) {
  const expiresInSeconds = parseTimeToSeconds(expiresIn);

  return {
    ...data,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    iat: Math.floor(Date.now() / 1000),
  };
}
