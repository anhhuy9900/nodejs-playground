import crypto from 'crypto';
import fs from 'fs';

/**
 * Computes a SHA-256 hex digest of a file's content.
 *
 * Stored in the migration history record when a migration is applied.
 * On subsequent `status` calls, the current file hash is compared against the
 * stored hash to detect accidental edits to already-applied migrations.
 */
export function computeFileChecksum(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('sha256').update(content).digest('hex');
}
