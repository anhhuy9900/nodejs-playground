import async from 'async';

// ...or ES2017 async functions
const urls = [
  'https://my-json-server.typicode.com/typicode/demo/comments',
  'https://dummyjson.com/products?delay=2000',
  'https://dummyapi.io/data/v1/user?limit=100',
  'https://reqres.in/api/users',
  'https://fakestoreapi.com/carts',
];
async.mapLimit(
  urls,
  5,
  async function (url: string) {
    const response = await fetch(url);
    console.log(`URL: ${url}, statusText:${response.statusText}`);
  },
  (err, results) => {
    if (err) throw err;
    // results is now an array of the response bodies
    console.log(results);
  }
);
