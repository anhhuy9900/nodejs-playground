import { MigrationGenerator } from '../core/migration-generator';
import { loadConfig } from '../utils/config-loader';

/**
 * Generates a new timestamped migration file inside the configured migrations directory.
 */
export function generateCommand(
  name: string,
  configPath: string | undefined,
): void {
  const config = loadConfig(configPath);
  const migrationsDir = config.migrationsDir ?? './migrations';
  const generator = new MigrationGenerator(migrationsDir);
  generator.generate(name);
}
