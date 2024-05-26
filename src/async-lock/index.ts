import express from 'express';
import AsyncLock from 'async-lock';
import {v4 as uuidv4} from 'uuid';
import TopicModel from '../lib/models/topic.model';

const lock = new AsyncLock();

export async function syncProcessRequest(reqInfo: Record<string, any>) {
    lock.acquire(
        'SYNC_PROCESS_REQUEST',
        async (done: () => void): Promise<void> => {
            console.log("-----------------------------------------------------------------");
            console.log("--------------Request: lockAcquired: ", uuidv4());
            done();
        },
        (err, ret: any) => {
            console.log("--------------Request: lockReleased --------------");
        },
        {});
}

export async function lockProcessAction(id: string | number) {
    lock.acquire(
        'LOCK_PROCESS_ACTION',
        async (done: () => void): Promise<void> => {
            console.log("-----------------------------------------------------------------");
            console.log("--------------Request ", id, " lockAcquired");

            setTimeout(function () {
                console.log("--------------Request ", id, " Done");
                done();  // <---- call the callback, once the lock can be released
            }, 3000);
        },
        (err, ret: any) => {
            console.log("--------------Request ", id, " lockReleased");
        },
        {});
}

export async function lockProcessAccessDB() {
    lock.acquire(
        'LOCK_PROCESS_ACCESS_DB',
        async (done: () => void): Promise<void> => {
            console.log("-----------------------------------------------------------------");
            console.log("--------------LOCK_PROCESS_ACCESS_DB - Request lockAcquired");
            const arr: number[] = Array.from(Array(10), (_, i) => i);
            const data = await TopicModel.insertMany(arr.map(el => ({
                name: 'LOCK_PROCESS_ACCESS_DB',
                type: 'async-lock',
                data: {
                    index: el,
                    value: uuidv4()
                }
            })));
            console.log("--------------LOCK_PROCESS_ACCESS_DB - Request Done -> data: ", data?.length);
            done();
        },
        (err, ret: any) => {
            console.log("--------------LOCK_PROCESS_ACCESS_DB - Request lockReleased");
        },
        {});
}

const routers = express();
routers.get("/request-sync-lock", async (req, res) => {
    await syncProcessRequest(req);
    res.status(200).send("Run test sync lock request");
});

routers.get("/async-lock-process", async (req, res) => {
    await lockProcessAction(1);
    res.status(200).send("Run test async lock process request");
});

routers.get("/lock-process-access-db", async (req, res) => {
    await lockProcessAccessDB();
    res.status(200).send("Run test lock process request to access DB");
});

export {
    routers
}