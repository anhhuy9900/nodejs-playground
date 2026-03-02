/**
 * Example migration: create a "posts" collection with a reference to users.
 */
import { Db, MongoClient } from 'mongodb';
import { MigrationFile } from '../../src';

const migration: MigrationFile = {
  async up(db: Db, _client: MongoClient): Promise<void> {
    await db.createCollection('posts', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['title', 'authorEmail', 'createdAt'],
          properties: {
            title: { bsonType: 'string' },
            body: { bsonType: 'string' },
            authorEmail: { bsonType: 'string' },
            tags: { bsonType: 'array', items: { bsonType: 'string' } },
            published: { bsonType: 'bool' },
            createdAt: { bsonType: 'date' },
          },
        },
      },
    });

    await db
      .collection('posts')
      .createIndex({ authorEmail: 1 }, { name: 'author_email' });

    await db
      .collection('posts')
      .createIndex({ tags: 1 }, { name: 'tags' });

    await db
      .collection('posts')
      .createIndex({ createdAt: -1 }, { name: 'created_at_desc' });
  },

  async down(db: Db, _client: MongoClient): Promise<void> {
    await db.collection('posts').drop();
  },
};

export default migration;
