import chalk from 'chalk';
import { Migrator } from '../core/migrator';
import { loadConfig } from '../utils/config-loader';
import { logger } from '../utils/logger';

/**
 * Prints the applied / pending status of every migration file.
 * Also shows an integrity badge when the file has changed since it was applied.
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
        // ── Integrity badge ────────────────────────────────────────────────
        let integrityBadge = '';
        if (s.integrity === 'modified') {
          integrityBadge = '  ' + chalk.red.bold('⚠ MODIFIED');
        } else if (s.integrity === 'unknown') {
          integrityBadge = '  ' + chalk.gray('? no checksum');
        }

        const meta = chalk.gray(
          `batch #${s.batch}  ${s.appliedAt?.toISOString()}  ${s.executionTime}ms`,
        );
        console.log(
          `  ${chalk.green('✔')} ${chalk.green(s.name)}  ${meta}${integrityBadge}`,
        );
      } else {
        console.log(
          `  ${chalk.yellow('○')} ${chalk.yellow(s.name)}  ${chalk.gray('(pending)')}`,
        );
      }
    }

    const applied = statuses.filter((s) => s.status === 'applied').length;
    const pending = statuses.filter((s) => s.status === 'pending').length;
    const modified = statuses.filter((s) => s.integrity === 'modified').length;

    console.log('');
    console.log(
      chalk.bold(
        `  Total: ${statuses.length}  │  ` +
          `Applied: ${chalk.green(applied)}  │  ` +
          `Pending: ${chalk.yellow(pending)}`,
      ),
    );

    // ── Integrity warning banner ───────────────────────────────────────────
    if (modified > 0) {
      console.log('');
      logger.warn(
        `${modified} applied migration(s) have been modified since they were applied!`,
      );
      logger.warn(
        'Editing an applied migration is dangerous — the database is already in the\n' +
          '  state produced by the original file. Consider writing a new migration instead.',
      );
    }

    console.log('');
  } finally {
    await migrator.disconnect();
  }
}
