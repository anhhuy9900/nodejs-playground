import express, { Request, Response } from 'express';

const apis = express();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome to Swagger-jsDoc!
 *     responses:
 *       200:
 *         description: A successful response
 */
apis.get('/users', (req: Request, res: Response) => {
    res.status(200).send('Hello World!');
});

/**
 * @swagger
 * /users/list:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: Successfully retrieved users
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

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the user to get
 *     responses:
 *       200:
 *         description: Successfully retrieved user
 *       404:
 *         description: User not found
 */
apis.get('/users/:id', (req: Request, res: Response) => {
    const userId = parseInt(req.params.id, 10);
    const users = [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Doe' },
    ];
    const user = users.find(u => u.id === userId);
    if (user) {
        res.status(200).send(user);
    } else {
        res.status(404).send({ message: 'User not found' });
    }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully created user
 */
apis.post('/users', (req: Request, res: Response) => {
    const newUser = req.body;
    // Here you would add logic to save the new user to a database
    res.status(201).send(newUser);
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update an existing user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated user
 *       404:
 *         description: User not found
 */
apis.put('/users/:id', (req: Request, res: Response) => {
    const userId = parseInt(req.params.id, 10);
    const updatedUser = req.body;
    // Here you would add logic to update the user in a database
    res.status(200).send({ id: userId, ...updatedUser });
});

export default apis;