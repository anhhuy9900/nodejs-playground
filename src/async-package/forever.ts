// src/foreverExample.ts
// async.forever is a utility function in the async package that runs an asynchronous task repeatedly until an error occurs.
// This can be useful for tasks that need to run continuously, such as polling a service or processing items from a queue.
import async from 'async';
import axios from 'axios';

// Function to fetch data from an API
const fetchData = (callback: (err?: Error | null) => void) => {
  axios
    .get('https://jsonplaceholder.typicode.com/posts/1')
    .then((response) => {
      console.log('=========================================');
      console.log('Fetched data:', response.data);
      // Wait for 5 seconds before the next iteration
      setTimeout(() => callback(null), 5000);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      callback(error); // Stop the loop if an error occurs
    });
};

// Using async.forever to repeatedly fetch data every 5 seconds
async.forever(fetchData, (err) => {
  console.error('An error occurred, stopping the loop:', err);
});
