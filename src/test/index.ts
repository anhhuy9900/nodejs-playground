const APP_PORT = 1990;
import app from './server';

(async (): Promise<void> => {
  app.listen(APP_PORT, async () => {
    console.log(`Running on ${APP_PORT}...`);
    console.log(`Nodejs server started open http://localhost:${APP_PORT}`);
  });
})();
