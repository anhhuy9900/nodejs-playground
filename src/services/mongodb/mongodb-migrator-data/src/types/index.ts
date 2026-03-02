import type { Db, MongoClient, MongoClientOptions } from 'mongodb';

/**
 * Each migration file must implement this interface.
 * `up` applies the migration; `down` reverts it.
 */
export interface MigrationFile {
  up(db: Db, client: MongoClient): Promise<void>;
  down(db: Db, client: MongoClient): Promise<void>;
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
  /** Batch number — migrations in the same `up` run share a batch */
  batch: number;
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
   * Use this to pass credentials without embedding them in the URI.
   * @example
   * options: { auth: { username: 'admin', password: 'secret' }, authSource: 'admin' }
   */
  options?: MongoClientOptions;
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
}

/**
 * Options for programmatic run calls.
 */
export interface RunnerOptions {
  config: MigratorConfig;
  /** Limit how many migrations to run/revert */
  steps?: number;
  /** Preview what would run without actually executing */
  dryRun?: boolean;
}
