import path from 'path';
import { ClientSession, Db, MongoClient } from 'mongodb';
import { MigratorConfig, MigrationFile, MigrationStatus } from '../types';
import { MigrationStore } from '../store/migration-store';
import { MigrationLock } from '../store/migration-lock';
import { getMigrationFiles, getMigrationName } from '../utils/file-utils';
import { computeFileChecksum } from '../utils/checksum';
import { logger } from '../utils/logger';

const DEFAULT_MIGRATIONS_DIR = './migrations';
const DEFAULT_MIGRATIONS_COLLECTION = 'migration_history';
const DEFAULT_LOCK_COLLECTION = 'migration_locks';
const DEFAULT_LOCK_TTL_SECONDS = 60;

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
 * Phase 1 additions:
 *  - Distributed concurrency lock (prevents parallel runs)
 *  - Per-migration MongoDB transactions (opt-in via `useTransactions`)
 *  - SHA-256 checksum stored per migration for integrity verification
 *  - Dry-run mode (preview without executing)
 *
 * @example
 * ```ts
 * const migrator = new Migrator({ uri, database });
 * await migrator.connect();
 * await migrator.up();
 * await migrator.disconnect();
 * ```
 */
export class Migrator {
  private readonly config: MigratorConfig & {
    migrationsDir: string;
    migrationsCollection: string;
    lockCollection: string;
    lockTtlSeconds: number;
  };

  private client: MongoClient | null = null;
  private db: Db | null = null;
  private store: MigrationStore | null = null;
  private lock: MigrationLock | null = null;

  constructor(config: MigratorConfig) {
    this.config = {
      migrationsDir: DEFAULT_MIGRATIONS_DIR,
      migrationsCollection: DEFAULT_MIGRATIONS_COLLECTION,
      lockCollection: DEFAULT_LOCK_COLLECTION,
      lockTtlSeconds: DEFAULT_LOCK_TTL_SECONDS,
      ...config,
    };
  }

  /** Opens the MongoDB connection and initialises the history store and lock. */
  async connect(): Promise<void> {
    this.client = new MongoClient(this.config.uri, this.config.options ?? {});
    await this.client.connect();
    this.db = this.client.db(this.config.database);
    this.store = new MigrationStore(this.db, this.config.migrationsCollection);
    this.lock = new MigrationLock(
      this.db,
      this.config.lockCollection,
      this.config.lockTtlSeconds,
    );
    await this.store.initialize();
    await this.lock.initialize();
    logger.success(`Connected to MongoDB: ${this.config.database}`);
  }

  /** Closes the MongoDB connection and clears all internal state. */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.store = null;
      this.lock = null;
    }
  }

  // ── Private guards ──────────────────────────────────────────────────────────

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

  private requireLock(): MigrationLock {
    if (!this.lock) throw new Error('Not connected. Call connect() first.');
    return this.lock;
  }

  private get migrationsDir(): string {
    return path.resolve(process.cwd(), this.config.migrationsDir);
  }

  // ── Internal helpers ────────────────────────────────────────────────────────

  private loadMigration(filePath: string): MigrationFile {
    if (filePath.endsWith('.ts')) {
      tryRegisterTsNode();
    }
    // Clear the require cache so watch-mode or repeated calls pick up changes
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
   * Runs `fn` inside a MongoDB multi-document transaction.
   * ⚠ Requires replica set or sharded cluster (MongoDB 4.0+).
   */
  private async runInTransaction(
    fn: (session: ClientSession) => Promise<void>,
  ): Promise<void> {
    const client = this.requireClient();
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await fn(session);
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Acquires the distributed lock or throws a descriptive error.
   * No-op during dry-run.
   */
  private async acquireLock(dryRun: boolean): Promise<void> {
    if (dryRun) return;
    const lock = this.requireLock();
    const acquired = await lock.acquire();
    if (!acquired) {
      const owner = await lock.getOwner();
      throw new Error(
        `Another migration process is already running:\n  ${owner ?? 'unknown owner'}\n\n` +
          'Wait for it to finish, or force-unlock with:\n' +
          '  mongodb-migrator-data repair --unlock',
      );
    }
  }

  private async releaseLock(dryRun: boolean): Promise<void> {
    if (dryRun) return;
    await this.requireLock().release();
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Runs all pending migrations (or up to `steps`).
   *
   * @param steps   Maximum number of pending migrations to apply.
   * @param opts.dryRun  Print what would run without touching the database.
   * @returns Number of migrations applied (or that would be applied in dry-run).
   */
  async up(steps?: number, opts?: { dryRun?: boolean }): Promise<number> {
    const dryRun = opts?.dryRun ?? false;
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

    // ── Dry-run: preview and exit ────────────────────────────────────────────
    if (dryRun) {
      logger.info(`[DRY RUN] ${toRun.length} migration(s) would be applied:`);
      for (const f of toRun) {
        logger.pending(`  ${getMigrationName(f)}`);
      }
      return toRun.length;
    }

    // ── Acquire concurrency lock ─────────────────────────────────────────────
    await this.acquireLock(dryRun);

    try {
      const batch = (await store.getLastBatch()) + 1;

      for (const filePath of toRun) {
        const name = getMigrationName(filePath);
        const checksum = computeFileChecksum(filePath);
        logger.pending(`Running: ${name}`);

        const migration = this.loadMigration(filePath);
        const start = Date.now();

        try {
          if (this.config.useTransactions) {
            await this.runInTransaction(async (session) => {
              await migration.up(db, client, session);
            });
          } else {
            await migration.up(db, client);
          }

          const executionTime = Date.now() - start;
          // Record AFTER the transaction commits so the history is accurate
          await store.record(name, executionTime, batch, checksum);
          logger.success(`Applied: ${name} (${executionTime}ms)`);
        } catch (err) {
          logger.error(`Failed: ${name}`);
          throw err;
        }
      }

      return toRun.length;
    } finally {
      await this.releaseLock(dryRun);
    }
  }

  /**
   * Reverts the last `steps` applied migrations (default: 1).
   * Pass `steps = -1` to revert all migrations in the last batch.
   *
   * @param steps   Number of migrations to revert. -1 = entire last batch.
   * @param opts.dryRun  Print what would be reverted without touching the DB.
   * @returns Number of migrations reverted (or that would be in dry-run).
   */
  async down(steps: number = 1, opts?: { dryRun?: boolean }): Promise<number> {
    const dryRun = opts?.dryRun ?? false;
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

    // ── Dry-run: preview and exit ────────────────────────────────────────────
    if (dryRun) {
      logger.info(`[DRY RUN] ${namesToRevert.length} migration(s) would be reverted:`);
      for (const name of namesToRevert) {
        logger.pending(`  ${name}`);
      }
      return namesToRevert.length;
    }

    // ── Acquire concurrency lock ─────────────────────────────────────────────
    await this.acquireLock(dryRun);

    const files = getMigrationFiles(this.migrationsDir);
    const fileMap = new Map(files.map((f) => [getMigrationName(f), f]));

    try {
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
          if (this.config.useTransactions) {
            await this.runInTransaction(async (session) => {
              await migration.down(db, client, session);
            });
          } else {
            await migration.down(db, client);
          }

          const executionTime = Date.now() - start;
          await store.remove(name);
          logger.success(`Reverted: ${name} (${executionTime}ms)`);
        } catch (err) {
          logger.error(`Failed to revert: ${name}`);
          throw err;
        }
      }

      return namesToRevert.length;
    } finally {
      await this.releaseLock(dryRun);
    }
  }

  /**
   * Returns the applied / pending status of every migration file,
   * including an integrity check comparing the current file hash
   * against the checksum stored when the migration was applied.
   */
  async status(): Promise<MigrationStatus[]> {
    const store = this.requireStore();
    const files = getMigrationFiles(this.migrationsDir);
    const applied = await store.getApplied();
    const appliedMap = new Map(applied.map((r) => [r.name, r]));

    return files.map((f) => {
      const name = getMigrationName(f);
      const record = appliedMap.get(name);

      let integrity: 'ok' | 'modified' | 'unknown' | undefined;
      if (record) {
        if (!record.checksum) {
          // Applied before checksum tracking was introduced
          integrity = 'unknown';
        } else {
          const currentChecksum = computeFileChecksum(f);
          integrity = currentChecksum === record.checksum ? 'ok' : 'modified';
        }
      }

      return {
        name,
        status: record ? 'applied' : 'pending',
        appliedAt: record?.appliedAt,
        batch: record?.batch,
        executionTime: record?.executionTime,
        integrity,
        checksum: record?.checksum,
      };
    });
  }

  /**
   * Force-releases the concurrency lock.
   * Used by `repair --unlock` to unblock a stale lock left by a crashed process.
   * Returns true if a lock was found and removed.
   */
  async forceUnlock(): Promise<boolean> {
    return this.requireLock().forceRelease();
  }
}
