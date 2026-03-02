import os from 'os';
import { Collection, Db, MongoServerError } from 'mongodb';

/**
 * A document stored in the lock collection.
 * We use a `lockKey` field (not `_id`) so there are no MongoDB driver type
 * complications and the unique index approach mirrors the intent cleanly.
 */
interface LockDocument {
  lockKey: string;
  lockedAt: Date;
  lockedBy: string; // "hostname:pid"
  expiresAt: Date;
}

const LOCK_KEY = 'global';

/**
 * MongoDB-backed distributed lock that prevents two processes from running
 * migrations concurrently.
 *
 * Approach:
 *  - A unique index on `lockKey` means only one document can ever exist.
 *  - A MongoDB TTL index on `expiresAt` auto-removes stale locks after `ttlSeconds`.
 *  - On acquire(), we try to insert the lock document; a duplicate-key error
 *    means another process holds the lock.
 *  - We also do a manual expiry check so we don't wait up to 60 s for the TTL
 *    daemon to clean up a crashed-process lock.
 */
export class MigrationLock {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly collection: Collection<any>;
  private readonly ttlSeconds: number;

  constructor(db: Db, collectionName: string, ttlSeconds: number = 60) {
    this.collection = db.collection(collectionName);
    this.ttlSeconds = ttlSeconds;
  }

  /**
   * Creates the unique index and TTL index.
   * Idempotent — safe to call on every connect().
   */
  async initialize(): Promise<void> {
    await this.collection.createIndex(
      { lockKey: 1 },
      { unique: true, name: 'lock_key_unique' },
    );
    // TTL index: MongoDB removes the document automatically when expiresAt < now
    await this.collection.createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0, name: 'lock_ttl' },
    );
  }

  /**
   * Tries to acquire the lock.
   * Returns `true` if the lock was successfully acquired, `false` if another
   * process currently holds it.
   */
  async acquire(): Promise<boolean> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.ttlSeconds * 1000);
    const lockedBy = `${os.hostname()}:${process.pid}`;

    try {
      await this.collection.insertOne({
        lockKey: LOCK_KEY,
        lockedAt: now,
        lockedBy,
        expiresAt,
      });
      return true;
    } catch (err) {
      if (err instanceof MongoServerError && err.code === 11000) {
        // Duplicate key — lock already exists. Check if it has expired manually
        // (the TTL daemon only runs every ~60 s, so a crashed process could
        // leave a stale lock for up to that long without this check).
        const existing = await this.collection.findOne({ lockKey: LOCK_KEY });
        if (existing && existing.expiresAt < now) {
          // Force-release the stale lock and try again
          await this.collection.deleteOne({ lockKey: LOCK_KEY });
          return this.acquire();
        }
        return false;
      }
      throw err;
    }
  }

  /**
   * Releases the lock held by the current process.
   */
  async release(): Promise<void> {
    await this.collection.deleteOne({ lockKey: LOCK_KEY });
  }

  /**
   * Returns a human-readable description of the current lock owner,
   * or null if no lock is held.
   */
  async getOwner(): Promise<string | null> {
    const doc = await this.collection.findOne({ lockKey: LOCK_KEY });
    if (!doc) return null;
    return `${doc.lockedBy} (locked at ${doc.lockedAt.toISOString()}, expires ${doc.expiresAt.toISOString()})`;
  }

  /**
   * Force-removes the lock document regardless of owner.
   * Used by the `repair --unlock` command.
   */
  async forceRelease(): Promise<boolean> {
    const result = await this.collection.deleteOne({ lockKey: LOCK_KEY });
    return result.deletedCount > 0;
  }
}
