import { Collection, Db } from 'mongodb';
import { MigrationRecord } from '../types';

/**
 * Manages the migration history collection in MongoDB.
 * Tracks which migrations have been applied, when, in what batch,
 * and their content checksum for integrity verification.
 */
export class MigrationStore {
  private collection: Collection<MigrationRecord>;

  constructor(db: Db, collectionName: string) {
    this.collection = db.collection<MigrationRecord>(collectionName);
  }

  /**
   * Ensures required indexes exist on the history collection.
   * Idempotent — safe to call on every connect().
   */
  async initialize(): Promise<void> {
    await this.collection.createIndex({ name: 1 }, { unique: true });
    await this.collection.createIndex({ batch: 1 });
    await this.collection.createIndex({ appliedAt: 1 });
  }

  /** Returns all applied migrations in ascending chronological order. */
  async getApplied(): Promise<MigrationRecord[]> {
    return this.collection.find({}).sort({ appliedAt: 1 }).toArray();
  }

  /** Returns a Set of applied migration names for O(1) lookup. */
  async getAppliedNames(): Promise<Set<string>> {
    const applied = await this.getApplied();
    return new Set(applied.map((r) => r.name));
  }

  /** Returns the highest batch number recorded, or 0 if none exist. */
  async getLastBatch(): Promise<number> {
    const last = await this.collection.findOne({}, { sort: { batch: -1 } });
    return last?.batch ?? 0;
  }

  /** Returns all migrations that belong to the latest batch, newest first. */
  async getLastBatchMigrations(): Promise<MigrationRecord[]> {
    const lastBatch = await this.getLastBatch();
    if (lastBatch === 0) return [];
    return this.collection
      .find({ batch: lastBatch })
      .sort({ appliedAt: -1 })
      .toArray();
  }

  /**
   * Records a successfully applied migration.
   * `checksum` is the SHA-256 hex digest of the migration file content.
   */
  async record(
    name: string,
    executionTime: number,
    batch: number,
    checksum: string,
  ): Promise<void> {
    await this.collection.insertOne({
      name,
      appliedAt: new Date(),
      executionTime,
      batch,
      checksum,
    });
  }

  /** Removes a migration record (used when reverting). */
  async remove(name: string): Promise<void> {
    await this.collection.deleteOne({ name });
  }
}
