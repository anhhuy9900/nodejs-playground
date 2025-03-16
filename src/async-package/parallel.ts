import async from 'async';
import axios from 'axios';

// Simulate fetching user data
const fetchUser = (callback: (err: Error | null, result?: any) => void) => {
  axios
    .get('https://dummyjson.com/products?delay=1000')
    .then((response) => callback(null, response.data))
    .catch((error) => callback(error));
};

// Simulate fetching posts data
const fetchPosts = (callback: (err: Error | null, result?: any) => void) => {
  axios
    .get('https://jsonplaceholder.typicode.com/posts?userId=1')
    .then((response) => callback(null, response.data))
    .catch((error) => callback(error));
};

// Simulate fetching comments data
const fetchComments = (callback: (err: Error | null, result?: any) => void) => {
  axios
    .get('https://jsonplaceholder.typicode.com/comments?postId=1')
    .then((response) => callback(null, response.data))
    .catch((error) => callback(error));
};

// Each API run parallel and  will receive data synchronous
async.parallel(
  {
    user: fetchUser,
    posts: fetchPosts,
    comments: fetchComments,
  },
  (err, results) => {
    if (err) {
      return console.error('Error fetching data:', err);
    }

    console.log('User:', results.user?.products?.length);
    console.log('Posts:', results.posts.length);
    console.log('Comments:', results.comments.length);
  }
);
