import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '.././test/server';

describe('User CRUD API', () => {
  beforeEach(() => {
    // Reset users before each test
    (global as any).users = [];
  });

  it('should create a new user', async () => {
    const response = await request(app).post('/users').send({ name: 'John Doe' });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('John Doe');
  });

  it('should get all users', async () => {
    await request(app).post('/users').send({ name: 'Alice' });

    const response = await request(app).get('/users');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].name).toBe('John Doe');
  });

  it('should update a user', async () => {
    const createRes = await request(app).post('/users').send({ name: 'Old Name' });
    const userId = createRes.body.id;

    const updateRes = await request(app).put(`/users/${userId}`).send({ name: 'New Name' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.name).toBe('New Name');
  });

  it('should delete a user', async () => {
    const createRes = await request(app).post('/users').send({ name: 'To Delete' });
    const userId = createRes.body.id;

    const deleteRes = await request(app).delete(`/users/${userId}`);
    expect(deleteRes.status).toBe(204);
  });
});
