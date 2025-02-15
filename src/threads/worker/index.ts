import express from 'express';
import cluster from 'cluster';
import os from 'os';
import {isMainThread, workerData, Worker, parentPort} from 'worker_threads';


const app = express();

function delay(duration: number) {
    const startTime = Date.now();
    while (Date.now() - startTime < duration) {
        //event loop is blocked...
    }
}

function countData() {
    for (let i = 0; i < 10000000000; i++) {

    }
    return 1;
}

app.get('/thread-1', (rep, res) => {
    res.send(`Performance example: ${process.pid}`);
});

function runPromise() {
    return new Promise((resolve, reject) => {
        console.log('========== PROMISE ==========');
        const val = countData();
        console.log('val: ', val);
        resolve(val)
    })
}

app.get('/thread-2', (rep, res) => {
    runPromise();

    res.send(`Performance example: ${process.pid} with the value: 1`);
});

app.get('/thread-3', (rep, res) => {

    setTimeout(() => {
        console.log('========== setTimeout ==========');
        const val = countData()
        console.log('val: ', val);
    }, 100);

    res.send(`Performance example: ${process.pid} with the value: 1`);

});


app.get('/blocking', async (req, res) => {
    await createWorker("./src/threads/worker/worker.js");
    //delay(10000)

    res.send(`Ding ding ding! ${process.pid}`);
});


console.log('Running server.js...');

function createWorker(filename: string) {
    return new Promise(function (resolve, reject) {
        const worker = new Worker(filename, {
            workerData: {thread_count: 4},
        });
        worker.on("message", (data) => {
            resolve(data);
        });
        worker.on("error", (msg) => {
            reject(`An error ocurred: ${msg}`);
        });
    });
}

// const worker = new Worker("./src/threads/worker.js", { workerData: { thread_count: 4, path: './worker.ts' }});
// worker.on("message", msg => console.log(`Worker message received: ${msg}`));
// worker.on("error", err => console.error(err));
// worker.on("exit", code => console.log(`Worker exited with code ${code}.`));

app.listen(3000, async () => {
    console.log(`Running on ${3000}...`);
    console.log(`Nodejs server started open http://localhost:${3000}`);
});