import path from 'path';
import { Db, MongoClient } from 'mongodb';
import { MigratorConfig, MigrationFile, MigrationStatus } from '../types';
import { MigrationStore } from '../store/migration-store';
import { getMigrationFiles, getMigrationName } from '../utils/file-utils';
import { logger } from '../utils/logger';

const DEFAULT_MIGRATIONS_DIR = './migrations';
const DEFAULT_MIGRATIONS_COLLECTION = 'migration_history';

let tsNodeRegistered = false;

function tryRegisterTsNode(): void {
  if (tsNodeRegistered) return;
  try {
    require('ts-node/register');
    tsNodeRegistered = true;
  } catch {
    // ts-node not available — assume migration files have been compiled to JS
  }
}

/**
 * Core migration engine.
 *
 * Usage:
 * ```ts
 * const migrator = new Migrator({ uri, database });
 * await migrator.connect();
 * await migrator.up();
 * await migrator.disconnect();
 * ```
 */
export class Migrator {
  private readonly config: Required<MigratorConfig>;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private store: MigrationStore | null = null;

  constructor(config: MigratorConfig) {
    this.config = {
      migrationsDir: DEFAULT_MIGRATIONS_DIR,
      migrationsCollection: DEFAULT_MIGRATIONS_COLLECTION,
      ...config,
    };
  }

  /** Opens the MongoDB connection and initialises the history store. */
  async connect(): Promise<void> {
    this.client = new MongoClient(this.config.uri);
    await this.client.connect();
    this.db = this.client.db(this.config.database);
    this.store = new MigrationStore(this.db, this.config.migrationsCollection);
    await this.store.initialize();
    logger.success(`Connected to MongoDB: ${this.config.database}`);
  }

  /** Closes the MongoDB connection. */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.store = null;
    }
  }

  private requireDb(): Db {
    if (!this.db) throw new Error('Not connected. Call connect() first.');
    return this.db;
  }

  private requireClient(): MongoClient {
    if (!this.client) throw new Error('Not connected. Call connect() first.');
    return this.client;
  }

  private requireStore(): MigrationStore {
    if (!this.store) throw new Error('Not connected. Call connect() first.');
    return this.store;
  }

  private get migrationsDir(): string {
    return path.resolve(process.cwd(), this.config.migrationsDir);
  }

  private loadMigration(filePath: string): MigrationFile {
    if (filePath.endsWith('.ts')) {
      tryRegisterTsNode();
    }

    // Clear cache so re-running in tests or watch mode picks up changes
    delete require.cache[require.resolve(filePath)];

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(filePath);
    const migration: MigrationFile = mod.default ?? mod;

    if (
      typeof migration.up !== 'function' ||
      typeof migration.down !== 'function'
    ) {
      throw new Error(
        `Migration "${filePath}" must export an object with "up" and "down" async functions.`,
      );
    }

    return migration;
  }

  /**
   * Runs all pending migrations (or up to `steps` migrations).
   * Returns the number of migrations applied.
   */
  async up(steps?: number): Promise<number> {
    const store = this.requireStore();
    const db = this.requireDb();
    const client = this.requireClient();

    const files = getMigrationFiles(this.migrationsDir);
    const appliedNames = await store.getAppliedNames();

    const pending = files.filter((f) => !appliedNames.has(getMigrationName(f)));
    const toRun = steps !== undefined ? pending.slice(0, steps) : pending;

    if (toRun.length === 0) {
      logger.info('No pending migrations.');
      return 0;
    }

    const batch = (await store.getLastBatch()) + 1;

    for (const filePath of toRun) {
      const name = getMigrationName(filePath);
      logger.pending(`Running: ${name}`);

      const migration = this.loadMigration(filePath);
      const start = Date.now();

      try {
        await migration.up(db, client);
        const executionTime = Date.now() - start;
        await store.record(name, executionTime, batch);
        logger.success(`Applied: ${name} (${executionTime}ms)`);
      } catch (err) {
        logger.error(`Failed: ${name}`);
        throw err;
      }
    }

    return toRun.length;
  }

  /**
   * Reverts the last `steps` migrations (default: 1).
   * Pass `steps = -1` to revert all migrations in the last batch.
   * Returns the number of migrations reverted.
   */
  async down(steps: number = 1): Promise<number> {
    const store = this.requireStore();
    const db = this.requireDb();
    const client = this.requireClient();

    let namesToRevert: string[];

    if (steps === -1) {
      const lastBatch = await store.getLastBatchMigrations();
      namesToRevert = lastBatch.map((r) => r.name);
    } else {
      const applied = await store.getApplied();
      namesToRevert = applied
        .slice(-steps)
        .reverse()
        .map((r) => r.name);
    }

    if (namesToRevert.length === 0) {
      logger.info('No migrations to revert.');
      return 0;
    }

    const files = getMigrationFiles(this.migrationsDir);
    const fileMap = new Map(files.map((f) => [getMigrationName(f), f]));

    for (const name of namesToRevert) {
      const filePath = fileMap.get(name);
      if (!filePath) {
        logger.warn(`Migration file not found for "${name}" — skipping.`);
        continue;
      }

      logger.pending(`Reverting: ${name}`);
      const migration = this.loadMigration(filePath);
      const start = Date.now();

      try {
        await migration.down(db, client);
        const executionTime = Date.now() - start;
        await store.remove(name);
        logger.success(`Reverted: ${name} (${executionTime}ms)`);
      } catch (err) {
        logger.error(`Failed to revert: ${name}`);
        throw err;
      }
    }

    return namesToRevert.length;
  }

  /**
   * Returns the status (pending / applied) of every migration file.
   */
  async status(): Promise<MigrationStatus[]> {
    const store = this.requireStore();
    const files = getMigrationFiles(this.migrationsDir);
    const applied = await store.getApplied();
    const appliedMap = new Map(applied.map((r) => [r.name, r]));

    return files.map((f) => {
      const name = getMigrationName(f);
      const record = appliedMap.get(name);
      return {
        name,
        status: record ? 'applied' : 'pending',
        appliedAt: record?.appliedAt,
        batch: record?.batch,
        executionTime: record?.executionTime,
      };
    });
  }
}
