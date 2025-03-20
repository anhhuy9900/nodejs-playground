// async.retry is a utility function in the async package that allows you to retry an asynchronous operation multiple times before failing.
// This can be useful for operations that may occasionally fail due to transient issues, such as network requests.
// Here's an example demonstrating how to use async.retry to fetch data from an API, retrying up to 5 times in case of failure:

import async from 'async';
import axios from 'axios';

// Function to fetch data from an API
const fetchData = (callback: (err: Error | null, result?: any) => void) => {
  console.log('=============== FETCH DATA ===============');
  axios
    .get('https://dummyapi.io/data/v1/user?limit=100')
    .then((response) => callback(null, response.data))
    .catch((error) => callback(error));
};

// Using async.retry to retry the fetch operation up to 5 times
async.retry(
  { times: 5, interval: 8000 }, // Retry up to 5 times with a 1-second interval between retries
  fetchData,
  (err, result) => {
    if (err) {
      console.error('Failed to fetch data after 5 retries:', err.message);
    }

    console.log('Fetched data successfully:', result);
  }
);
