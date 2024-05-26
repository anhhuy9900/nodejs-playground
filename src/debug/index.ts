import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

function countData() {
    for (let i = 0; i < 10000000; i++) {
  
    }
    return 1;
}

app.get('/debug', (rep, res) => {
    const a = countData();
    // console.log(a)
    res.send(`Test Debug`);
});

app.listen(3000, async () => {
    console.log(`Running on ${3000}...`);
    console.log(`Nodejs server started open http://localhost:${3000}`);
});