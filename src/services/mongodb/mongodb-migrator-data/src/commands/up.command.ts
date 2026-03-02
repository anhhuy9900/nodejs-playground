import chalk from 'chalk';
import { Migrator } from '../core/migrator';
import { loadConfig } from '../utils/config-loader';
import { logger } from '../utils/logger';

/**
 * Runs all pending migrations (or up to `steps` if provided).
 * When `dryRun` is true, prints what would run without touching the database.
 */
export async function upCommand(
  configPath: string | undefined,
  steps?: number,
  dryRun?: boolean,
): Promise<void> {
  const config = loadConfig(configPath);
  const migrator = new Migrator(config);

  try {
    await migrator.connect();
    console.log('');

    if (dryRun) {
      logger.title(chalk.gray.bold.underline('[DRY RUN] Pending migrations'));
    } else {
      logger.title(chalk.bold.underline('Running migrations (up)'));
    }
    console.log('');

    const count = await migrator.up(steps, { dryRun });

    if (!dryRun) {
      console.log('');
      logger.title(
        count > 0
          ? chalk.green(`✔ ${count} migration(s) applied successfully.`)
          : chalk.gray('Nothing to migrate.'),
      );
      console.log('');
    }
  } finally {
    await migrator.disconnect();
  }
}
