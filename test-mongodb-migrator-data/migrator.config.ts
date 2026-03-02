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
import { MigratorConfig } from 'mongodb-migrator-data';

const config: MigratorConfig = {
  /** MongoDB connection string — prefer environment variables for credentials */
  uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017',

  /** The database to migrate */
  database: process.env.MONGODB_DATABASE ?? 'mongodb-migrator-data',

  /** Directory that holds migration files (default: "./migrations") */
  migrationsDir: './migrations',

  /** Collection used to track applied migrations (default: "migration_history") */
  migrationsCollection: 'migration_history',

  /**
   * MongoDB authentication options.
   * Your Docker MongoDB was started with MONGO_INITDB_ROOT_USERNAME/PASSWORD,
   * so all commands require these admin credentials with authSource=admin.
   *
   * Alternatively embed credentials directly in the URI:
   *   uri: 'mongodb://admin:admin@localhost:27017/?authSource=admin'
   */
  options: {
    auth: {
      username: process.env.MONGODB_USER ?? 'admin',
      password: process.env.MONGODB_PASS ?? 'admin',
    },
    authSource: 'admin',
  },
};

export default config;
