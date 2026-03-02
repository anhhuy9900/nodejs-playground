import chalk from 'chalk';
import { Migrator } from '../core/migrator';
import { loadConfig } from '../utils/config-loader';
import { logger } from '../utils/logger';

/**
 * Runs all pending migrations (or up to `steps` if provided).
 */
export async function upCommand(
  configPath: string | undefined,
  steps?: number,
): Promise<void> {
  const config = loadConfig(configPath);
  const migrator = new Migrator(config);

  try {
    await migrator.connect();
    console.log('');
    logger.title(chalk.bold.underline('Running migrations (up)'));
    console.log('');

    const count = await migrator.up(steps);

    console.log('');
    logger.title(
      count > 0
        ? chalk.green(`✔ ${count} migration(s) applied successfully.`)
        : chalk.gray('Nothing to migrate.'),
    );
    console.log('');
  } finally {
    await migrator.disconnect();
  }
}
