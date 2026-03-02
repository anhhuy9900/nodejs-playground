/**
 * Example migrator config file.
 *
 * Copy this file to your project root, rename it to `migrator.config.ts`,
 * and adjust the values for your environment.
 *
 * The CLI automatically discovers config files named:
 *   migrator.config.ts / migrator.config.js
 *   migration.config.ts / migration.config.js
 *
 * Or pass a custom path: --config ./path/to/config.ts
 */
import { MigratorConfig } from '../src';

const config: MigratorConfig = {
  /** MongoDB connection string — prefer environment variables for credentials */
  uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017',

  /** The database to migrate */
  database: process.env.MONGODB_DATABASE ?? 'mydb',

  /** Directory that holds migration files (default: "./migrations") */
  migrationsDir: './migrations',

  /** Collection used to track applied migrations (default: "migration_history") */
  migrationsCollection: 'migration_history',
};

export default config;
