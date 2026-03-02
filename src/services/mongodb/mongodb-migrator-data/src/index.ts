/**
 * mongodb-migrator-data
 *
 * Public API for programmatic use in other TypeScript/Node.js projects.
 *
 * @example
 * ```ts
 * import { Migrator, MigratorConfig } from 'mongodb-migrator-data';
 *
 * const config: MigratorConfig = {
 *   uri: process.env.MONGODB_URI!,
 *   database: 'mydb',
 *   migrationsDir: './migrations',
 * };
 *
 * const migrator = new Migrator(config);
 * await migrator.connect();
 * await migrator.up();
 * await migrator.disconnect();
 * ```
 */

// ─── Core ─────────────────────────────────────────────────────────────────────
export { Migrator } from './core/migrator';
export { MigrationGenerator } from './core/migration-generator';

// ─── Store ───────────────────────────────────────────────────────────────────
export { MigrationStore } from './store/migration-store';

// ─── Utilities ───────────────────────────────────────────────────────────────
export { loadConfig } from './utils/config-loader';

// ─── Types ───────────────────────────────────────────────────────────────────
export type {
  MigrationFile,
  MigrationRecord,
  MigratorConfig,
  MigrationStatus,
  RunnerOptions,
} from './types';
