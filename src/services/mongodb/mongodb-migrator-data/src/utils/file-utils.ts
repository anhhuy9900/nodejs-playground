import fs from 'fs';
import path from 'path';

/**
 * Returns sorted migration file paths from the given directory.
 * Supports both .ts and .js files (excludes .d.ts declaration files).
 */
export function getMigrationFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) => /\.(ts|js)$/.test(file) && !file.endsWith('.d.ts'))
    .sort()
    .map((file) => path.join(dir, file));
}

/**
 * Extracts the migration name from a file path (basename without extension).
 */
export function getMigrationName(filePath: string): string {
  return path.basename(filePath, path.extname(filePath));
}

/**
 * Creates a directory (and parents) if it does not already exist.
 */
export function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Generates a YYYYMMDDHHmmss timestamp string for migration file names.
 */
export function generateTimestamp(): string {
  const now = new Date();
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

/**
 * Builds a timestamped migration filename from a human-readable name.
 * e.g. "create users" → "20240101120000_create_users"
 */
export function formatMigrationFilename(name: string): string {
  const timestamp = generateTimestamp();
  const safeName = name
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
  return `${timestamp}_${safeName}`;
}
