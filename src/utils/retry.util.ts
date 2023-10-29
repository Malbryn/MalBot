export const retry = async <T>(
    fn: () => Promise<T> | T,
    retries: number = 5,
    retryIntervalMs: number = 10000
): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) {
            throw error;
        }

        await sleep(retryIntervalMs);
        return retry(fn, retries - 1, retryIntervalMs);
    }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
