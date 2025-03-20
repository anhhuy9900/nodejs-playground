import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

let users: { id: number; name: string }[] = [];

app.get('/users', (_req: Request, res: Response) => {
  res.json(users);
});

app.post('/users', (req: Request, res: Response) => {
  const newUser = { id: users.length + 1, name: req.body.name };
  users.push(newUser);
  res.status(201).json(newUser);
});

// @ts-ignore
app.put('/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.name = req.body.name;
  res.json(user);
});

app.delete('/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  users = users.filter((u) => u.id !== id);
  res.status(204).send();
});

export default app;
