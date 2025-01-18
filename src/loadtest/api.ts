import express, { Request, Response } from "express";

const app = express();

app.get('/loadtest', (req: Request, res: Response) => {
    res.status(200).send('Load test!!!');
});

app.listen(8000, function () {
    console.log("Start server load test with port 8000");
});