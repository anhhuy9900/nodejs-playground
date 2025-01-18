(async () => {
    const { loadTest } = await import('loadtest');
    const jwt = require('jsonwebtoken');

    function generateToken() {
        const createToken = (payload, secret) => {
            const token = jwt.sign(payload, secret, { expiresIn: '1h' });
            return token;
        };
        const payload = { userId: 123, username: 'johndoe' };
        const secret = 'jwt-secret';
        const token = createToken(payload, secret);
        return token;
    }

    const dataParams = [
        {
            num: 'A123456',
            pId: '970416'
        },
        {
            num: 'BV12345',
            pId: '970438'
        }
    ]

    const options = {
        url: 'http://localhost:8082/external/v1/account-payment/mode',
        maxRequests: 10000, // Total number of requests
        concurrency: 10, // Number of concurrent connections
        requestsPerSecond: 1000, // Target requests per second
        maxSeconds: 10, // Max time to run the test (in seconds)
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': generateToken(),
        },
        requestGenerator: (params, options, client, callback) => {
            const random = Math.round(Math.random());
            const reqParams = dataParams[random];
            const reqUrl = `/external/v1/account-payment/mode?num=${reqParams.num}&pId=${reqParams.pId}`;
            options.path = reqUrl;
            // console.log('\n\n--------------------------------');
            // console.log('LOG -> options: ', options);
            const request = client(options, callback);
            return request;
        },
        statusCallback: (error, result, latency) => {
            if (error) {
                console.error('Error:', error);
                return;
            }

            if (result) {
                console.log(`Request index: ${result.requestIndex}, url: ${result.path}, completed with status: ${result.statusCode}, response time: ${result.requestElapsed}ms, Latency: ${latency}`);
            } else {
                console.error('Result is undefined.');
            }
        },
    };

    loadTest(options, (error, result) => {
        if (error) {
            return console.error('Error:', error);
        }
        console.log('Tests completed successfully.');
        console.log(`Total Requests: ${result.totalRequests}`);
        console.log(`Total Errors: ${result.totalErrors}`);
        console.log(`Mean Latency: ${result.meanLatencyMs} ms`);
        console.info('Result:', JSON.stringify(result));
    });
})();