"use strict"
//Selamlar Aşapıdaki örnek ile sağlamasını yapabilirsin.
//Engin EROL
//https://erdincuzun.com/makine_ogrenmesi/k-nn-algoritmasi/
let iterasyon = 1
let itr = true
let maxIteration = 2
//let data = []
/* for (let i = 0; i < 1000; i++) {
    data.push({ x: (Math.random() * 100), y: (Math.random() * 100) })
} */

const data = [
    { x: 1, y: 1 },
    { x: 1.5, y: 2 },
    { x: 3, y: 4 },
    { x: 5, y: 7 },
    { x: 3.5, y: 5 },
    { x: 4.5, y: 5 },
    { x: 3.5, y: 4.5 },
]
console.log("--------------------")
console.log("Girilen Data")
console.table(data)
console.log("--------------------")
const K = 2
console.log("--------------------")
console.log("Seçilen K Değeri ", K)
console.log("--------------------")
//center sayısı K değeri dir
//let Cumes = []
/* for (let i = 0; i < K; i++) {
    Cumes.push([{ x: (Math.random() * 100), y: (Math.random() * 100) }])
} */
console.log("--------------------")
console.log("Rastgele Seçilen Küme Merkezleri")

//let Cumes = prepareCume(K, data)
let Cumes = [
    [
        { x: 1.5, y: 2 },
    ]
    ,
    [
        { x: 5, y: 7 }
    ]
]
let fPoint = { x: 2.5, y: 6 }
console.table(Cumes)
console.log("--------------------")
let nCumeCounts = []
console.time("KMeans")
let text = true;
while (itr) {
    console.log(" ")
    console.log(`----------------------------- ${iterasyon} Numaralı Iterasyon Başlangıç-----------------------------------------------------------------------`)
    console.log(" ")
    let oCumeCounts = []
    text = true;
    for (let i = 0; i < data.length; i++) {
        let D = []
        let _D = []
        text = true;
        for (let k = 0; k < K; k++) {
            //Kume merkezini hesapla
            let _cumeCenter = cumeCenter(Cumes[k])
            console.log(" ")
            console.log(`${k + 1} Numaralı Küme Merkezini yeniden hesapla: `, cumeCentertext(Cumes[k]), " - ", `${i + 1} numaralı nokta `, `(x:${data[i].x} - y:${data[i].y})`)
            for (let j = 0; j < Cumes[k].length; j++) {
                let diff = distance(_cumeCenter, data[i])
                if (text) {
                    console.log("Mesafe : ", "", distancetext(_cumeCenter, data[i]), " = ", diff)
                    text = false
                }
                D.push(diff)
                _D.push({ data: data[i], dataIndex: i, cumes: Cumes[k][j], cumeIndex: j, diff, KIndex: k, K: k + 1, _cumeCenter })
            }
            text = true
        }

        let minDis = _D.find(item => item.diff == D.sort()[0])

        console.log(" ")
        console.log("En Küçük Mesafe : ", minDis.diff, " Veri noktası ", `{X:${data[i].x},Y:${data[i].y}}`, " için ", "seçilen küme : ", minDis.K)
        console.log("------------------------------------------------------------")

        if (typeof minDis != "undefined")
            if (!searchPoint(Cumes[minDis.KIndex], minDis.data)) {
                movePoint(Cumes, minDis.KIndex, minDis.data)
            }
    }

    for (let c = 0; c < Cumes.length; c++) {
        oCumeCounts.push(Cumes[c].length)
    }

    if (nCumeCounts.length != 0)
        if (isSame(nCumeCounts[nCumeCounts.length - 1], oCumeCounts)) {
            itr = false
        }
    nCumeCounts.push(oCumeCounts)



    if (maxIteration != 0) if (iterasyon == maxIteration) itr = false
    if (maxIteration != 0) if (iterasyon == maxIteration) console.log(`max Iteration ${maxIteration} değeri ile sınırlanmıştır.!!!`)
    iterasyon++
    if (iterasyon > 100) {
        console.log(`Max Iterasyon ${iterasyon} değerine ulaştığı için Zorlu Kapatma seçeneği ile kapatıldı.`)
        itr = false
    }
    console.log(`İterasyon : ${iterasyon}  - Sonucu Kümeler`)
    if (itr) console.table(Cumes)
    console.log(`------------------------------------------------------------------------------------------------------------------------------------------`)
}

console.log("Kümelenme")
console.table(Cumes)
if (typeof fPoint != "undefined") {
    console.log(" ")
    let KNNResult = KNN(Cumes, fPoint, 5)
    console.log(`X:${fPoint.x} Y:${fPoint.y} noktası ${KNNResult.Kindex} Kümesine dahildir.`)
    console.log(" ")
}

function KNN(Cumes, point, K = 5) {
    let min;
    let KPoint;
    let index;
    let distObj = []
    for (let i = 0; i < Cumes.length; i++) {
        for (let j = 0; j < Cumes[i].length; j++) {
            if (typeof min == "undefined") min = distance(Cumes[i][j], point)
            if (min > distance(Cumes[i][j], point)) {
                min = distance(Cumes[i][j], point)
                index = i
                KPoint = Cumes[i]

            }
            //console.log(`x:${point.x},y:${point.y} noktasına göre mesafeler : ${min.toFixed(2)}`)
            distObj.push({ min, i, j, KPoint })
        }
    }
    distObj.sort((a, b) => (a.min > b.min) ? 1 : -1)

    //distObj.map(item => console.log(`Sıralanmış mesafe : ${item.min.toFixed(2)} - Küme değeri : ${item.i+1}`))
    //console.log(`x:${point.x},y:${point.y} noktasına göre mesafeler : ${min.toFixed(2)}`)
    let KK = []
    let count = 1
    for (let s = 0; s < K; s++) {
        let _idx = KK.findIndex(item => item.i == distObj[s].i)
        if (_idx != -1) {
            //güncelle
            KK[_idx].count++
        } else {
            //yeni değer oluştur
            KK.push({ i: distObj[s].i, count })
        }
    }

    let KKSORT = KK.sort((a, b) => (a.count > b.count) ? 1 : -1)
    console.table(KKSORT)
    let _KKSORT = KKSORT[KKSORT.length - 1]
    return {
        min_distance: min, Kindex: _KKSORT.i, KPoint: distObj[_KKSORT.i].KPoint,
    }
}
function movePoint(Cumes, moveIndex, point) {
    Cumes[moveIndex].push(point)
    for (let i = 0; i < Cumes.length; i++) {
        if (i != moveIndex) {
            let idx = findPointIndex(Cumes[i], point)
            if (idx != -1) {
                Cumes[i].splice(idx, 1)
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
function cumeCenter(cumePoints) {
    let XTotal = 0
    let YTotal = 0
    for (let i = 0; i < cumePoints.length; i++) {
        XTotal += cumePoints[i].x
        YTotal += cumePoints[i].y
    }
    return { x: (XTotal / cumePoints.length), y: (YTotal / cumePoints.length) }
}
function cumeCentertext(cumePoints) {
    let XTotal = 0
    let YTotal = 0
    for (let i = 0; i < cumePoints.length; i++) {
        XTotal += cumePoints[i].x
        YTotal += cumePoints[i].y
    }
    return `{x:(${XTotal}/${cumePoints.length}),y:(${YTotal}/${cumePoints.length})}`
}
function searchPoint(cume, point) {
    for (let i = 0; i < cume.length; i++) {
        if (cume[i].x == point.x && cume[i].y == point.y) {
            return true
        }
    }
    return false
}
function findPointIndex(cume, point) {
    for (let i = 0; i < cume.length; i++) {
        if (cume[i].x == point.x && cume[i].y == point.y) {
            return i
        }
    }
    return -1
}
function distance(X1, X2) {
    //console.log("object", X1, X2)
    return Math.sqrt(Math.pow((X2.x - X1.x), 2) + Math.pow((X2.y - X1.y), 2))
}
function distancetext(X1, X2) {
    return `sqrt(pow(${X2.x}-${X1.x}) + pow(${X2.y}-${X1.y}))`
}
function prepareCume(K, datas) {
    let Cumes = []
    if (typeof datas == "undefined") {
        for (let i = 0; i < K; i++) {
            Cumes.push([{ x: (Math.random() * 100), y: (Math.random() * 100) }])
        }
    } else {
        for (let i = 0; i < K; i++) {
            let findTr = true
            while (findTr) {
                let selectedData = Math.floor(Math.random() * datas.length)
                if (!searchPoint(datas, selectedData)) {
                    Cumes.push([{ x: datas[selectedData].x, y: datas[selectedData].y }])
                    findTr = false
                }
            }
        }
    }
    return Cumes
}
