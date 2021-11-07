const path = require('path');
(async () => {
    const {
        Worker, isMainThread, parentPort, workerData, threadId
    } = require('worker_threads');
    const workerPath = path.resolve('kmeans-threaded.js');
    if (isMainThread) {
        module.exports = (data,kNumber, cluster, iterasyon,wait, waitStop,nclusterCounts, itr) => {
            return new Promise((resolve, reject) => {
                const worker = new Worker(workerPath, { workerData: JSON.stringify({ data,kNumber, cluster, iterasyon,wait, waitStop,nclusterCounts,itr }) })
                worker.on("message", resolve)
                worker.on("error", reject)
                worker.on('exit', (code) => {
                    if (code !== 0)
                        reject(new Error(`Worker stopped with exit code ${code}`));
                });
            })
        }
    }
})()