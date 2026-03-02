import fs from 'fs';
import path from 'path';
import { ensureDir, formatMigrationFilename } from '../utils/file-utils';
import { logger } from '../utils/logger';

const MIGRATION_TEMPLATE = `import { Db, MongoClient } from 'mongodb';
import { MigrationFile } from 'mongodb-migrator-data';

const migration: MigrationFile = {
  /**
   * Apply the migration — create collections, add indexes, seed data, etc.
   */
  async up(db: Db, _client: MongoClient): Promise<void> {
    // TODO: implement migration
  },

  /**
   * Revert the migration — drop collections, remove indexes, etc.
   */
  async down(db: Db, _client: MongoClient): Promise<void> {
    // TODO: implement rollback
  },
};

export default migration;
`;

/**
 * Generates new timestamped migration files from the built-in template.
 */
export class MigrationGenerator {
  private readonly migrationsDir: string;

  constructor(migrationsDir: string) {
    this.migrationsDir = path.resolve(process.cwd(), migrationsDir);
  }

  /**
   * Creates a new migration file with the given name.
   * Returns the absolute path of the created file.
   */
  generate(name: string): string {
    ensureDir(this.migrationsDir);

    const filename = `${formatMigrationFilename(name)}.ts`;
    const filePath = path.join(this.migrationsDir, filename);

    if (fs.existsSync(filePath)) {
      throw new Error(`Migration file already exists: ${filename}`);
    }

    fs.writeFileSync(filePath, MIGRATION_TEMPLATE, 'utf-8');

    logger.success(`Generated: ${filename}`);
    logger.info(`  → ${filePath}`);

    return filePath;
  }
}
