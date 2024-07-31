// src/app.ts
import express, { Request, Response } from 'express';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import index from './apis'

const app = express();
const port = 3000;


// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'My API',
            version: '1.0.0',
            description: 'My API Information',
            contact: {
                name: 'Developer',
            },
            servers: [{ url: 'http://localhost:3000' }],
        },
    },
    apis: [path.join(__dirname, './**/*.ts')], // Adjust the path to include all TypeScript files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/', index)

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});