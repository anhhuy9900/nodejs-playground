import chalk from 'chalk';
import { Migrator } from '../core/migrator';
import { loadConfig } from '../utils/config-loader';
import { logger } from '../utils/logger';

/**
 * Prints a table showing the applied/pending status of every migration file.
 */
export async function statusCommand(
  configPath: string | undefined,
): Promise<void> {
  const config = loadConfig(configPath);
  const migrator = new Migrator(config);

  try {
    await migrator.connect();
    console.log('');
    logger.title(chalk.bold.underline('Migration Status'));
    console.log('');

    const statuses = await migrator.status();

    if (statuses.length === 0) {
      logger.info('No migration files found.');
      return;
    }

    for (const s of statuses) {
      if (s.status === 'applied') {
        const meta = chalk.gray(
          `batch #${s.batch}  ${s.appliedAt?.toISOString()}  ${s.executionTime}ms`,
        );
        console.log(`  ${chalk.green('✔')} ${chalk.green(s.name)}  ${meta}`);
      } else {
        console.log(
          `  ${chalk.yellow('○')} ${chalk.yellow(s.name)}  ${chalk.gray('(pending)')}`,
        );
      }
    }

    const applied = statuses.filter((s) => s.status === 'applied').length;
    const pending = statuses.filter((s) => s.status === 'pending').length;

    console.log('');
    console.log(
      chalk.bold(
        `  Total: ${statuses.length}  │  ` +
          `Applied: ${chalk.green(applied)}  │  ` +
          `Pending: ${chalk.yellow(pending)}`,
      ),
    );
    console.log('');
  } finally {
    await migrator.disconnect();
  }
}
