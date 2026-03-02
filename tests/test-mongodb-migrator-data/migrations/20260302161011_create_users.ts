import { Db, MongoClient } from 'mongodb';
import { MigrationFile } from 'mongodb-migrator-data';

const migration: MigrationFile = {
  /**
   * Apply the migration — create collections, add indexes, seed data, etc.
   */
  async up(db: Db, _client: MongoClient): Promise<void> {
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
    await db.collection('users').createIndex({ email: 1 }, { unique: true, name: 'email_unique' });

    await db.collection('users').createIndex({ createdAt: -1 }, { name: 'created_at_desc' });

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

  /**
   * Revert the migration — drop collections, remove indexes, etc.
   */
  async down(db: Db, _client: MongoClient): Promise<void> {
    await db.collection('users').drop();
  },
};

export default migration;
