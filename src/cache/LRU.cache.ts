type CacheEntry<V> = {
  value: V;
  expiry?: number;
};

class LRUCache {
  private cache: Map<string, any>;
  private readonly limit: number;
  private readonly defaultExpireTime: number = 5000;
  private cleanupIntervalId: NodeJS.Timeout | null = null;

  constructor(limit = 10) {
    this.cache = new Map();
    this.limit = limit;
    this.autoCleanCache();
  }

  _expiredTime(entry: any): boolean {
    if (!entry || !entry.expireTime) return true;
    return entry.expireTime <= Date.now();
  }

  get(key: string) {
    if (!this.cache.has(key)) return null;
    // Re-insert to make it most recently used
    const cache = this.cache.get(key);

    if (this._expiredTime(cache)) {
      this.cache.delete(key);
      return null;
    }

    const { value, expireTime } = cache;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: string, value: any, expireTime?: number) {
    if (this.cache.has(key)) {
      // Remove so we can re-insert (update order)
      this.cache.delete(key);
    } else if (this.cache.size >= this.limit) {
      // Remove least recently used (first inserted)
      const lruKey = this.cache.keys().next().value;
      if (typeof lruKey === 'string') {
        this.cache.delete(lruKey);
      }
    }

    const entry = {
      value,
      expireTime: expireTime ? Date.now() + expireTime : Date.now() + this.defaultExpireTime,
    };
    this.cache.set(key, entry);
  }

  has(key: string) {
    return this.cache.has(key);
  }

  delete(key: string) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }

  keys() {
    return Array.from(this.cache.keys());
  }

  autoCleanCache() {
    this.cleanupIntervalId = setInterval(() => {
      for (const [key, entry] of this.cache.entries()) {
        if (this._expiredTime(entry)) {
          this.cache.delete(key);
        }
      }
    }, 1000);
  }

  //auto destroy cache data + interval auto clean when it's called
  destroy() {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }
    this.clear();
  }
}

// Example usage:
const cache = new LRUCache(3);
cache.set('a', 111111, 20000);

console.log(cache.keys());

setTimeout(() => {
  console.log('--------------');
  console.log('After 10s to check cache: %j', cache.keys());
}, 10000);

setTimeout(() => {
  console.log('--------------');
  console.log('After 30s to check cache: %j', cache.keys());
}, 30000);
