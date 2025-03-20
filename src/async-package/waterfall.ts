import async from 'async';
import axios from 'axios';

// Function to fetch user data
const fetchUser = (callback: (err: Error | null, user?: any) => void) => {
  axios
    .get('https://jsonplaceholder.typicode.com/users/1')
    .then((response) => callback(null, response.data))
    .catch((error) => callback(error));
};

// Function to fetch posts for a user
const fetchPosts = (user: any, callback: (err: Error | null, user?: any, posts?: any) => void) => {
  axios
    .get(`https://jsonplaceholder.typicode.com/posts?userId=${user.id}`)
    .then((response) => callback(null, user, response.data))
    .catch((error) => callback(error));
};

// Function to fetch comments for the first post
const fetchComments = (
  user: any,
  posts: any,
  callback: (err: Error | null, result?: any) => void
) => {
  if (posts.length === 0) {
    return callback(new Error('No posts found for user'));
  }

  axios
    .get(`https://jsonplaceholder.typicode.com/comments?postId=${posts[0].id}`)
    .then((response) =>
      callback(null, {
        user,
        posts,
        comments: response.data,
      })
    )
    .catch((error) => callback(error));
};

// Using async.waterfall to run the functions sequentially
async.waterfall([fetchUser, fetchPosts, fetchComments], (err, result: any) => {
  if (err) {
    console.error('Error:', err);
  }

  Object.keys(result).forEach((key) => {
    console.log(`waterfall - ${key}: `, result[key].length);
  });
  // console.log('Final Result:', result);
});
