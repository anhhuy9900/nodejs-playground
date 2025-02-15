import axios from 'axios';

// ...or ES2017 async functions
const urls = [
    'https://my-json-server.typicode.com/typicode/demo/comments',
    'https://dummyjson.com/products?delay=2000',
    'https://dummyapi.io/data/v1/user?limit=100',
    'https://reqres.in/api/users',
    'https://fakestoreapi.com/carts'
]


async function fetchContent(url: string)  {
    console.log('fetchContent - url: ', url);
    try {
        return fetch(url).then(response => {
            console.log(`URL: ${url}, statusText:${response.statusText}`)
            return `URL: ${url}, then-data: ${response.statusText}`
        });
    } catch (err: any) {
        console.log(err)
        return err.message
    }
}

async function axiosFetchContent(url: string)  {
    console.log('axiosFetchContent - url: ', url);
    try {
        return axios.get(url)
            .then(response => {
                console.log(`URL: ${url}, statusText:${response.statusText}`)
                return `URL: ${url}, then-data: ${response.statusText}`
            })
            .catch(error => `URL: ${url}, err-data: ${error.message}`);
    } catch (err: any) {
        console.log(err)
        return err.message
    }
}

const promiseAll = async () => {
    const promises = urls.map(url => fetchContent(url))
    const process = await Promise.all(promises);
    console.log('promiseAll - process: ', process);
}
promiseAll();

