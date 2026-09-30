export class RateLimiter {
  private static store = new Map<string, { count: number; expiresAt: number }>();
  
  static check(ip: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.store.get(ip);
    
    if (!record || record.expiresAt < now) {
      this.store.set(ip, { count: 1, expiresAt: now + windowMs });
      return true;
    }
    
    if (record.count >= limit) {
      return false;
    }
    
    record.count++;
    this.store.set(ip, record);
    return true;
  }
}
