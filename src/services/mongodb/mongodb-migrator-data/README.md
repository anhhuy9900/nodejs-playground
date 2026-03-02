### Package Migration Schema and Data to MongoDB
- I want to build a npm package service to migrate schema, data, it include for other projects nodejs typescript
- There are main features for migration package: allowing you to make changes (like creating tables, adding columns, or setting up associations) in a structured, trackable way
- When I run the migration, it will check the schema and data, and if there are any changes, it will apply the changes to the database
- When  migrated complete, the package need to create collection in mongo to store migration history
- Each migration file is a Typescript file that exports two functions: up applies the changes (e.g., creates a table), and down reverts them (e.g., drops the table).
- The package should support command-line interface is the primary tool for generating and running migrations on the command line
- The package should support export interface feature to allow other projects to use it
- The package should set name "mongodb-migrator-data"

---

# mongodb-migrator-data

A structured, trackable MongoDB schema and data migration package for Node.js TypeScript projects.

## Features

- **Structured migrations** — each migration is a TypeScript file with `up` / `down` functions
- **Migration history** — applied migrations are tracked in a dedicated MongoDB collection (`migration_history`)
- **CLI tool** — generate, run, revert, and inspect migrations from the command line
- **Programmatic API** — import and use the `Migrator` class directly inside your application
- **TypeScript-first** — ships with full type declarations; supports `.ts` migration files via `ts-node`
- **Batch tracking** — migrations applied in the same `up` run share a batch number, making targeted rollbacks easy

## Installation

```bash
npm install mongodb-migrator-data
# peer dependency
npm install mongodb
# needed at runtime to load .ts migration/config files
npm install -D ts-node typescript
```

## Quick Start

### 1. Create a config file

Create `migrator.config.ts` in your project root:

```ts
import { MigratorConfig } from 'mongodb-migrator-data';

const config: MigratorConfig = {
  uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017',
  database: 'mydb',
  migrationsDir: './migrations',          // default
  migrationsCollection: 'migration_history', // default
};

export default config;
```

### 2. Generate a migration

```bash
npx mongodb-migrator-data generate create_users_collection
# → migrations/20240101120000_create_users_collection.ts
```

### 3. Edit the generated file

```ts
import { Db, MongoClient } from 'mongodb';
import { MigrationFile } from 'mongodb-migrator-data';

const migration: MigrationFile = {
  async up(db: Db, _client: MongoClient): Promise<void> {
    await db.createCollection('users');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
  },

  async down(db: Db, _client: MongoClient): Promise<void> {
    await db.collection('users').drop();
  },
};

export default migration;
```

### 4. Run migrations

```bash
npx mongodb-migrator-data up
```

## CLI Reference

| Command | Description |
|---|---|
| `up` | Run all pending migrations |
| `up --steps <n>` | Run at most N pending migrations |
| `down` | Revert the last migration |
| `down --steps <n>` | Revert the last N migrations |
| `down --steps -1` | Revert all migrations in the last batch |
| `status` | Show applied / pending status of all migrations |
| `generate <name>` | Generate a new timestamped migration file |

**Global options** (apply to all commands):

| Option | Description |
|---|---|
| `--config <path>` | Custom path to the migrator config file |
| `--version` | Print package version |
| `--help` | Show help |

## Programmatic API

```ts
import { Migrator, MigratorConfig, MigrationStatus } from 'mongodb-migrator-data';

const config: MigratorConfig = { uri: '...', database: 'mydb' };
const migrator = new Migrator(config);

await migrator.connect();

// run pending migrations
const applied = await migrator.up();

// revert last 2 migrations
const reverted = await migrator.down(2);

// list migration statuses
const statuses: MigrationStatus[] = await migrator.status();

await migrator.disconnect();
```

### `MigratorConfig`

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `uri` | `string` | ✅ | — | MongoDB connection URI |
| `database` | `string` | ✅ | — | Database name |
| `migrationsDir` | `string` | | `./migrations` | Directory with migration files |
| `migrationsCollection` | `string` | | `migration_history` | Collection for tracking history |

### `MigrationFile` interface

Every migration file must export (as default) an object satisfying:

```ts
interface MigrationFile {
  up(db: Db, client: MongoClient): Promise<void>;
  down(db: Db, client: MongoClient): Promise<void>;
}
```

## Project Structure

```
mongodb-migrator-data/
├── src/
│   ├── index.ts                  # Public API exports
│   ├── cli.ts                    # CLI entry point
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── core/
│   │   ├── migrator.ts           # Core migration engine
│   │   └── migration-generator.ts # Migration file generator
│   ├── store/
│   │   └── migration-store.ts    # MongoDB history collection
│   ├── commands/
│   │   ├── up.command.ts
│   │   ├── down.command.ts
│   │   ├── status.command.ts
│   │   └── generate.command.ts
│   └── utils/
│       ├── logger.ts
│       ├── file-utils.ts
│       └── config-loader.ts
└── examples/
    ├── migrator.config.example.ts
    └── migrations/
        ├── 20240101000000_create_users_collection.ts
        └── 20240102000000_add_posts_collection.ts
```

### Build CLI

```
 Method 1 — Direct path install (fastest for dev iteration)                                                                                                                                               
                                                                                                                                                                                                           
  # ── Step 1: Build the package ──────────────────────────────────────────                                                                                                                                
  cd /Volumes/Huy_HD/practices/nodejs-playground/src/services/mongodb/mongodb-migrator-data                                                                                                                
  npm install          # install deps (chalk, commander, mongodb, ts-node, typescript)
  npm run build        # compiles src/ → dist/

  # ── Step 2: Create a test consumer project ─────────────────────────────
  mkdir ~/test-migrator && cd ~/test-migrator
  npm init -y

  # ── Step 3: Install the package from its local path ────────────────────
  npm install /Volumes/Huy_HD/practices/nodejs-playground/src/services/mongodb/mongodb-migrator-data
  npm install -D ts-node typescript @types/node

  # ── Step 4: Test the CLI ───────────────────────────────────────────────
  npx mongodb-migrator-data --version
  npx mongodb-migrator-data --help

  Drawback: node_modules/mongodb-migrator-data is a symlink to the source folder. Rebuilding the package reflects immediately, but it doesn't simulate what a real consumer gets.

  ---
  Method 2 — npm pack tarball (recommended, most realistic)

  This creates the exact same .tgz that npm publish would produce.

  # ── Step 1: Build the package ──────────────────────────────────────────
  cd /Volumes/Huy_HD/practices/nodejs-playground/src/services/mongodb/mongodb-migrator-data
  npm install
  npm run build

  # ── Step 2: Pack into a tarball ────────────────────────────────────────
  npm pack
  # → creates: mongodb-migrator-data-1.0.0.tgz
  # → also prints the exact files that would be published (verify dist/ is included)

  # ── Step 3: Create a test consumer project ─────────────────────────────
  mkdir ~/test-migrator && cd ~/test-migrator
  npm init -y
  npm install -D ts-node typescript @types/node
  npm install mongodb

  # ── Step 4: Install from the tarball (simulates npm install exactly) ───
  npm install /Volumes/Huy_HD/practices/nodejs-playground/src/services/mongodb/mongodb-migrator-data/mongodb-migrator-data-1.0.0.tgz

  # ── Step 5: Create the config file ────────────────────────────────────
  cat > migrator.config.ts << 'EOF'
  import { MigratorConfig } from 'mongodb-migrator-data';

  const config: MigratorConfig = {
    uri: 'mongodb://localhost:27017',
    database: 'test_migrator_db',
  };

  export default config;

  # ── Step 6: Run CLI commands ───────────────────────────────────────────
  npx mongodb-migrator-data --version
  npx mongodb-migrator-data generate create_users
  npx mongodb-migrator-data status
  npx mongodb-migrator-data up
  npx mongodb-migrator-data down
```

## License

MIT
