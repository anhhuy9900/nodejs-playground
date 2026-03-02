import type { ClientSession, Db, MongoClient, MongoClientOptions } from 'mongodb';

/**
 * Each migration file must implement this interface.
 *
 * `up`   — applies the migration (create collections, add indexes, seed data …)
 * `down` — reverts the migration (drop collections, remove indexes …)
 *
 * The optional `session` parameter is provided when `useTransactions: true` is
 * set in the config. Pass it to every MongoDB operation to enroll them in the
 * transaction. Existing migration files that ignore the third argument continue
 * to work without changes.
 */
export interface MigrationFile {
  up(db: Db, client: MongoClient, session?: ClientSession): Promise<void>;
  down(db: Db, client: MongoClient, session?: ClientSession): Promise<void>;
}

/**
 * A record stored in the migrations history collection.
 */
export interface MigrationRecord {
  _id?: string;
  /** Migration file name without extension */
  name: string;
  /** When the migration was applied */
  appliedAt: Date;
  /** How long the migration took in milliseconds */
  executionTime: number;
  /** Batch number — migrations in the same `up` run share a batch number */
  batch: number;
  /**
   * SHA-256 hex digest of the migration file content at the time it was applied.
   * Used by `status` to detect accidental edits to already-applied migrations.
   * Absent on records created before checksum tracking was introduced.
   */
  checksum?: string;
}

/**
 * Configuration passed to the Migrator (programmatic API or config file).
 */
export interface MigratorConfig {
  /**
   * MongoDB connection URI.
   * Credentials can be embedded directly in the URI:
   *   mongodb://username:password@localhost:27017/?authSource=admin
   * Or provided separately via `options.auth`.
   */
  uri: string;
  /** Target database name */
  database: string;
  /** Directory containing migration files (default: "./migrations") */
  migrationsDir?: string;
  /** Collection name used to track applied migrations (default: "migration_history") */
  migrationsCollection?: string;
  /**
   * Additional MongoClient options (auth, tls, replicaSet, etc.).
   * @example
   * options: { auth: { username: 'admin', password: 'secret' }, authSource: 'admin' }
   */
  options?: MongoClientOptions;

  // ── Phase 1: Production-safety options ────────────────────────────────────

  /**
   * Wrap each individual migration's `up` / `down` call in a MongoDB
   * multi-document transaction.
   *
   * ⚠ Requires a replica set or sharded cluster (MongoDB 4.0+).
   *   Will throw on a standalone instance.
   *
   * Default: false
   */
  useTransactions?: boolean;

  /**
   * Collection used to hold the distributed concurrency lock.
   * Default: "migration_locks"
   */
  lockCollection?: string;

  /**
   * Seconds before a lock is considered stale and is force-released.
   * Protects against a crashed migration process leaving the lock forever.
   * Default: 60
   */
  lockTtlSeconds?: number;
}

/**
 * Represents the status of a single migration file.
 */
export interface MigrationStatus {
  name: string;
  status: 'pending' | 'applied';
  appliedAt?: Date;
  batch?: number;
  executionTime?: number;
  /**
   * Integrity check result (only present for applied migrations):
   * - `"ok"`       — file matches the checksum stored when it was applied
   * - `"modified"` — file has changed since it was applied  ⚠ dangerous
   * - `"unknown"`  — migration was applied before checksum tracking was added
   */
  integrity?: 'ok' | 'modified' | 'unknown';
  /** Stored SHA-256 checksum (hex) */
  checksum?: string;
}

/**
 * Options for programmatic run calls.
 */
export interface RunnerOptions {
  config: MigratorConfig;
  /** Limit how many migrations to run/revert */
  steps?: number;
  /**
   * Preview what would run without connecting to the database or making changes.
   * Prints the list of pending / to-be-reverted migrations and exits.
   */
  dryRun?: boolean;
}
