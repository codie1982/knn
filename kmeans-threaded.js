//Selamlar Aşapıdaki örnek ile sağlamasını yapabilirsin.
//Engin EROL
//https://erdincuzun.com/makine_ogrenmesi/k-nn-algoritmasi/
( () => {
    const { Worker, isMainThread, threadId, parentPort, workerData } = require('worker_threads');
    const { movePoint, isSame, clusterCenter, searchPoint, distance,KNN } = require("./util/util")
    "use strict"
    //promise 
    return new Promise((resolve, reject) => {
        let _dt = JSON.parse(workerData)
        let datas = _dt.data
        let Clusters = _dt.cluster
        let iterasyon = _dt.iterasyon
        let itr = _dt.itr
        let wait = _dt.wait
        let waitStop = _dt.waitStop
        //let i = _dt.index
        let kNumber = _dt.kNumber

        let nClusterCounts = _dt.nclusterCounts
        console.time("KMeans")
        console.log(`${threadId} CPU Thread ...`);
        let oClusterCounts = []
        for (let i = 0; i < datas.length; i++) {
            let D = []
            let _D = []
            for (let k = 0; k < kNumber; k++) {
                //Kume merkezini hesapla
                let _clusterCenter = clusterCenter(Clusters[k])

                for (let j = 0; j < Clusters[k].length; j++) {
                    let diff = distance(_clusterCenter, datas[i])
                    D.push(diff)
                    _D.push({ data: datas[i], dataIndex: i, clusters: Clusters[k][j], clusterIndex: j, diff, KIndex: k, K: k + 1, _clusterCenter })
                }
            }

            //en düşük mesafe
            let minDis = _D.find(item => item.diff == D.sort()[0])
            if (typeof minDis != "undefined")
                if (!searchPoint(Clusters[minDis.KIndex], minDis.data)) {
                    movePoint(Clusters, minDis.KIndex, minDis.data)
                }
        }
        for (let c = 0; c < Clusters.length; c++) {
            oClusterCounts.push(Clusters[c].length)
        }

        if (nClusterCounts.length != 0)
            if (isSame(nClusterCounts[nClusterCounts.length - 1], oClusterCounts)) {
                wait++
                if (wait > waitStop) {
                    itr = false
                }
            } else {
                wait = 0
                waitStop = 2
            }

        nClusterCounts.push(oClusterCounts)
        iterasyon++
        if (iterasyon > 100) {
            console.log("Zorunlu Kapatma", iterasyon)
            itr = false
        }
        parentPort.postMessage(JSON.stringify({ itr, iterasyon, Clusters, wait, waitStop, nClusterCounts }));
        resolve(parentPort)
    })
})()