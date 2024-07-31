import express, { Request, Response } from 'express';

const apis = express();

/**
 * @swagger
 * /users:
 *  get:
 *    description: Welcome to Swagger-jsDoc!
 *    responses:
 *      '200':
 *        description: A successful response
 */
apis.get('/users', (req: Request, res: Response) => {
    res.status(200).send('Hello World!');
});

/**
 * @swagger
 * /users/list:
 *  get:
 *    description: Get all users
 *    responses:
 *      '200':
 *        description: Successfully retrieved users
 */
apis.get('/users/list', (req: Request, res: Response) => {
    res.status(200).send([
        {
            id: 1,
            name: 'John Doe',
        },
        {
            id: 2,
            name: 'Jane Doe',
        },
    ]);
});

export default apis;