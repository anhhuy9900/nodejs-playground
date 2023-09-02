import { APP_PORT } from './constants';
import { App } from './app';

(async() => {
    
    App.listen(APP_PORT, async () => {
        console.log(`Running on ${APP_PORT}...`);
        console.log(`Nodejs-redis server started open http://localhost:${APP_PORT}`);
    });
})();