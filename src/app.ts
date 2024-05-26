import express from 'express';
import bodyParser from 'body-parser';
import { routers as AsyncLockRouters } from './async-lock';

const App = express();
App.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
App.use(bodyParser.json());
App.use(AsyncLockRouters);
App.get("/", async (req, res) => {
    res.status(200).send("Welcome to Nodejs-redis home page");
});
export {
    App
}