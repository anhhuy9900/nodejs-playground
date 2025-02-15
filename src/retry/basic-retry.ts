const basicRetry = async (fn: any, retryNum: number = 0, delay: number = 1000) => {
    try {
        await fn();
    } catch (error: any) {
        console.log('Retrying... error: ', error.message);
        if (retryNum < 0 || retryNum > 3) {
            return;
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
        console.log('Retrying... Attempt: ', retryNum);
        await basicRetry(fn, retryNum + 1);
    }
}

let globalVar = 0;
basicRetry(() => {
    if (globalVar < 3) {
        globalVar++;
        throw new Error('Error');
    }
    console.log('The function run success: ', globalVar);
}, 0).then();