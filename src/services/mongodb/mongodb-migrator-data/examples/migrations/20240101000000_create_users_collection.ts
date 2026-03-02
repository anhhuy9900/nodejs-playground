/**
 * Example migration: create a "users" collection with schema validation and indexes.
 *
 * Each migration file must export an object with two functions:
 *   - up()   → apply the migration
 *   - down() → revert the migration
 */
import { Db, MongoClient } from 'mongodb';
import { MigrationFile } from '../../src';

const migration: MigrationFile = {
  async up(db: Db, _client: MongoClient): Promise<void> {
    // 1. Create collection with JSON Schema validation
    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['email', 'createdAt'],
          additionalProperties: true,
          properties: {
            email: {
              bsonType: 'string',
              description: 'must be a string and is required',
            },
            name: {
              bsonType: 'string',
            },
            role: {
              bsonType: 'string',
              enum: ['admin', 'user', 'guest'],
            },
            createdAt: {
              bsonType: 'date',
            },
          },
        },
      },
    });

    // 2. Create indexes
    await db
      .collection('users')
      .createIndex({ email: 1 }, { unique: true, name: 'email_unique' });

    await db
      .collection('users')
      .createIndex({ createdAt: -1 }, { name: 'created_at_desc' });

    // 3. Seed initial data
    await db.collection('users').insertMany([
      {
        email: 'admin@example.com',
        name: 'Admin',
        role: 'admin',
        createdAt: new Date(),
      },
    ]);
  },

  async down(db: Db, _client: MongoClient): Promise<void> {
    await db.collection('users').drop();
  },
};

export default migration;
