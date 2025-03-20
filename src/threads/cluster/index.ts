// import cluster from "cluster";
import express from 'express';

function delay(duration: number) {
  const startTime = Date.now();
  while (Date.now() - startTime < duration) {
    //event loop is blocked...
  }
}

// console.log('cluster: ', cluster)
// if (cluster.isPrimary) {
//     const totalCPUs = os.availableParallelism();
//     console.log(`Number of CPUs is ${totalCPUs}`);
//     console.log(`Primary ${process.pid} is running`);

//     // Fork workers.
//     for (let i = 0; i < totalCPUs; i++) {
//       cluster.fork();
//     }

//     cluster.on("exit", (worker, code, signal) => {
//       console.log(`worker ${worker.process.pid} died`);
//       console.log("Let's fork another worker!");
//       cluster.fork();
//     });
// } else {
//     const app = express();
//     console.log(`Worker ${process.pid} started`);
//     app.get('/thread-1', (rep, res) => {
//         res.send(`Performance example: ${process.pid}`);
//     });

//     app.get('/blocking', async(req, res) => {
//         delay(10000)

//         res.send(`Ding ding ding! ${process.pid}`);
//     });

//   app.listen(8000, function () {
//     console.log(
//       "Process " + process.pid + " is listening to all incoming requests"
//     );
//   });
// }

const app = express();
// console.log(`Worker ${process.pid} started`);
app.get('/thread-1', (rep, res) => {
  res.send(`Performance example: ${process.pid}`);
});

app.get('/blocking', async (req, res) => {
  delay(10000);

  res.send(`Ding ding ding! ${process.pid}`);
});

app.listen(8000, function () {
  console.log('Process ' + process.pid + ' is listening to all incoming requests');
});
