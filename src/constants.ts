import dotenv from 'dotenv';
import path from 'path';

const config = dotenv.config({ path: path.resolve(__dirname, '../.env') }).parsed;
console.log('-------------- APP config: ', JSON.stringify(config));

export const APP_PORT = config?.PORT || null;
export const MONGO_URI = config?.MONGO_URI || '';
export const AWS_ENV_REGION = config?.AWS_ENV_REGION || '';
export const AWS_ENV_ACCESS_KEY_ID = config?.AWS_ENV_ACCESS_KEY_ID || '';
export const AWS_ENV_SECRET_ACCESS_KEY = config?.AWS_ENV_SECRET_ACCESS_KEY || '';
