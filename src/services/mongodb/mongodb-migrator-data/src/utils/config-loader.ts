import fs from 'fs';
import path from 'path';
import { MigratorConfig } from '../types';

const DEFAULT_CONFIG_FILES = [
  'migrator.config.ts',
  'migrator.config.js',
  'migration.config.ts',
  'migration.config.js',
];

let tsNodeRegistered = false;

function registerTsNode(): void {
  if (tsNodeRegistered) return;
  try {
    require('ts-node/register');
    tsNodeRegistered = true;
  } catch {
    throw new Error(
      'ts-node is required to load TypeScript config/migration files.\n' +
        'Install it as a dev dependency: npm install -D ts-node typescript',
    );
  }
}

/**
 * Loads the migrator config from a file or auto-discovers it in cwd.
 *
 * Supports both TypeScript and JavaScript config files.
 * TypeScript files require `ts-node` to be installed in the consuming project.
 */
export function loadConfig(configPath?: string): MigratorConfig {
  let resolvedPath: string;

  if (configPath) {
    resolvedPath = path.resolve(process.cwd(), configPath);
  } else {
    const found = DEFAULT_CONFIG_FILES.map((f) =>
      path.resolve(process.cwd(), f),
    ).find((f) => fs.existsSync(f));

    if (!found) {
      throw new Error(
        `No config file found. Create one of: ${DEFAULT_CONFIG_FILES.join(', ')}\n` +
          'Or pass --config <path> to specify a custom config file.',
      );
    }

    resolvedPath = found;
  }

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Config file not found: ${resolvedPath}`);
  }

  if (resolvedPath.endsWith('.ts')) {
    registerTsNode();
  }

  // Clear require cache so hot-reloading works in dev scenarios
  delete require.cache[resolvedPath];

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require(resolvedPath);
  const config: MigratorConfig = mod.default ?? mod;

  validateConfig(config, resolvedPath);

  return config;
}

function validateConfig(config: MigratorConfig, filePath: string): void {
  if (!config || typeof config !== 'object') {
    throw new Error(`Invalid config exported from ${filePath}`);
  }
  if (!config.uri) {
    throw new Error(
      `Config "${filePath}" must include "uri" (MongoDB connection string)`,
    );
  }
  if (!config.database) {
    throw new Error(
      `Config "${filePath}" must include "database" (database name)`,
    );
  }
}
