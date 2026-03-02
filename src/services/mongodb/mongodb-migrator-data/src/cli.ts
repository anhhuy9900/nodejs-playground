#!/usr/bin/env node
import { Command } from 'commander';
import { upCommand } from './commands/up.command';
import { downCommand } from './commands/down.command';
import { statusCommand } from './commands/status.command';
import { generateCommand } from './commands/generate.command';
import { Migrator } from './core/migrator';
import { loadConfig } from './utils/config-loader';
import { logger } from './utils/logger';

const program = new Command();

program
  .name('mongodb-migrator-data')
  .description('MongoDB schema and data migration tool for TypeScript projects')
  .version('1.0.0');

// ─── up ──────────────────────────────────────────────────────────────────────
program
  .command('up')
  .description('Run all pending migrations')
  .option('-c, --config <path>', 'Path to migrator config file')
  .option('-s, --steps <number>', 'Maximum number of migrations to run', parseInt)
  .option(
    '--dry-run',
    'Preview which migrations would run without executing anything',
  )
  .action(
    async (options: { config?: string; steps?: number; dryRun?: boolean }) => {
      try {
        await upCommand(options.config, options.steps, options.dryRun);
      } catch (err) {
        logger.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    },
  );

// ─── down ────────────────────────────────────────────────────────────────────
program
  .command('down')
  .description('Revert the last migration (or last N with --steps)')
  .option('-c, --config <path>', 'Path to migrator config file')
  .option(
    '-s, --steps <number>',
    'Number of migrations to revert (use -1 to revert the entire last batch)',
    parseInt,
  )
  .option(
    '--dry-run',
    'Preview which migrations would be reverted without executing anything',
  )
  .action(
    async (options: { config?: string; steps?: number; dryRun?: boolean }) => {
      try {
        await downCommand(options.config, options.steps ?? 1, options.dryRun);
      } catch (err) {
        logger.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    },
  );

// ─── status ──────────────────────────────────────────────────────────────────
program
  .command('status')
  .description(
    'Show applied / pending status of all migrations (includes integrity check)',
  )
  .option('-c, --config <path>', 'Path to migrator config file')
  .action(async (options: { config?: string }) => {
    try {
      await statusCommand(options.config);
    } catch (err) {
      logger.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

// ─── generate ────────────────────────────────────────────────────────────────
program
  .command('generate <name>')
  .description(
    'Generate a new migration file (e.g. generate create_users_collection)',
  )
  .option('-c, --config <path>', 'Path to migrator config file')
  .action((name: string, options: { config?: string }) => {
    try {
      generateCommand(name, options.config);
    } catch (err) {
      logger.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

// ─── repair ──────────────────────────────────────────────────────────────────
program
  .command('repair')
  .description('Fix common migration issues (see sub-options below)')
  .option('-c, --config <path>', 'Path to migrator config file')
  .option(
    '--unlock',
    'Force-release a stale concurrency lock left by a crashed process',
  )
  .action(async (options: { config?: string; unlock?: boolean }) => {
    if (!options.unlock) {
      logger.warn('No repair action specified. Use --unlock to release a stale lock.');
      process.exit(0);
    }

    try {
      const config = loadConfig(options.config);
      const migrator = new Migrator(config);
      await migrator.connect();

      try {
        const released = await migrator.forceUnlock();
        if (released) {
          logger.success('Stale lock released successfully.');
        } else {
          logger.info('No lock found — nothing to release.');
        }
      } finally {
        await migrator.disconnect();
      }
    } catch (err) {
      logger.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

program.parse(process.argv);
