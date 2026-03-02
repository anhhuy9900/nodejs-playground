import { Db, MongoClient } from 'mongodb';

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
  /** MongoDB connection URI, e.g. "mongodb://localhost:27017" */
  uri: string;
  /** Target database name */
  database: string;
  /** Directory containing migration files (default: "./migrations") */
  migrationsDir?: string;
  /** Collection name used to track applied migrations (default: "migration_history") */
  migrationsCollection?: string;
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
