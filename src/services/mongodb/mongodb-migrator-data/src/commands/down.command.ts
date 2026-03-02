import chalk from 'chalk';
import { Migrator } from '../core/migrator';
import { loadConfig } from '../utils/config-loader';
import { logger } from '../utils/logger';

/**
 * Reverts the last `steps` migrations (default: 1).
 * Pass `steps = -1` to revert the entire last batch.
 */
export async function downCommand(
  configPath: string | undefined,
  steps: number = 1,
): Promise<void> {
  const config = loadConfig(configPath);
  const migrator = new Migrator(config);

  try {
    await migrator.connect();
    console.log('');
    logger.title(chalk.bold.underline('Reverting migrations (down)'));
    console.log('');

    const count = await migrator.down(steps);

    console.log('');
    logger.title(
      count > 0
        ? chalk.green(`✔ ${count} migration(s) reverted successfully.`)
        : chalk.gray('Nothing to revert.'),
    );
    console.log('');
  } finally {
    await migrator.disconnect();
  }
}
