function movePoint(Clusters, moveIndex, point) {
    Clusters[moveIndex].push(point)
    for (let i = 0; i < Clusters.length; i++) {
        if (i != moveIndex) {
            let idx = findPointIndex(Clusters[i], point)
            if (idx != -1) {
                Clusters[i].splice(idx, 1)
            }
        }
    }
}
function isSame(array1, array2) {
    if (array1.length != array2.length) return false;
    for (let i = 0; i < array1.length; i++) {
        if (array1[i] != array2[i]) {
            return false
        }
    }
    return true
}
function clusterCenter(clusterPoints) {
    let XTotal = 0
    let YTotal = 0
    for (let i = 0; i < clusterPoints.length; i++) {
        XTotal += clusterPoints[i].x
        YTotal += clusterPoints[i].y
    }
    return { x: (XTotal / clusterPoints.length), y: (YTotal / clusterPoints.length) }
}

function searchPoint(cluster, point) {
    for (let i = 0; i < cluster.length; i++) {
        if (cluster[i].x == point.x && cluster[i].y == point.y) {
            return true
        }
    }
    return false
}
function findPointIndex(cluster, point) {
    for (let i = 0; i < cluster.length; i++) {
        if (cluster[i].x == point.x && cluster[i].y == point.y) {
            return i
        }
    }
    return -1
}
function distance(X1, X2) {
    //console.log("object", X1, X2)
    let res = Math.sqrt(Math.pow((parseFloat(X2.x) - parseFloat(X1.x)), 2) + Math.pow((parseFloat(X2.y) - parseFloat(X1.y)), 2))
    return parseFloat(res).toFixed(2)
}

function KNN(Clusters, point, K = 1) {
    let min = null;
    let KPoint;
    let distObj = []
    for (let i = 0; i < Clusters.length; i++) {
        for (let j = 0; j < Clusters[i].length; j++) {
            let clusterPoint = Clusters[i][j] //seçilen küme noktası
            let dist = distance(point, clusterPoint)
            if (min == null) min = dist // ilk değeri alması için
            console.log("distance(Clusters[i][j], point)", dist)
            if (min < dist) {
                min = dist
                index = i //küme indexi
                KPoint = Clusters[i] //Küme noktası
            }
            distObj.push({ min, KPoint: i })
        }
    }
    distObj.sort((a, b) => (a.min > b.min) ? -1 : 1)

    let KK = []
    let count = 1
    for (let s = 0; s < K; s++) {
        let _idx = KK.findIndex(item => item.KPoint == distObj[s].KPoint)
        if (_idx != -1) {
            //güncelle
            KK[_idx].count++
        } else {
            //yeni değer oluştur
            KK.push({ KPoint: distObj[s].KPoint, count })
        }
    }

    let KKSORT = KK.sort((a, b) => (a.count > b.count) ? 1 : -1)
    console.table(KKSORT)
    let _KKSORT = KKSORT[KKSORT.length - 1]
    return {
        min_distance: min, Kindex: _KKSORT.KPoint,
    }
}
module.exports = {
    distance, findPointIndex, searchPoint, clusterCenter, isSame, movePoint, KNN
}