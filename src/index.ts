import { APP_PORT } from './constants';
import { App } from './app';
import MongoDBConnection from './lib/mongo-connect';

(async (): Promise<void> => {
  await new MongoDBConnection('mongodb://localhost:27017/nodejs-playground').connect();
  App.listen(APP_PORT, async () => {
    console.log(`Running on ${APP_PORT}...`);
    console.log(`Nodejs server started open http://localhost:${APP_PORT}`);
  });
})();
