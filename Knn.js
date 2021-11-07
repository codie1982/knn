const worker = require('./kmeans-worker');
const { KNN,searchPoint } = require('./util/util');
const inquirer = require('inquirer');
const ora = require('ora');
(async () => {
  const NS_PER_SEC = 1e9;
  const kMeansDataPrepare = async (kNumber, label) => {
    const spinner = ora(`Calculating with ${label}..`).start();
    let time;
    let itr = true;
    let iterasyon = 0
    let wait = 0
    let waitStop = 1
    let _result;

    try {
      const startTime = process.hrtime();
      //const datas = prepareData(7)
      const datas = [
        { x: 1, y: 1 },
        { x: 1.5, y: 2 },
        { x: 3, y: 4 },
        { x: 5, y: 7 },
        { x: 3.5, y: 5 },
        { x: 4.5, y: 5 },
        { x: 3.5, y: 4.5 },
      ]
      let Cumes = prepareCume(kNumber, datas)
      /*   let Cumes = [
          [
            { x: 1, y: 1 },
          ]
          ,
          [
            { x: 5, y: 7 }
          ]
        ] */
      let fPoint = { x: 11, y: 11 }
      let nCumeCounts = []
      while (itr) {
        result = await worker(datas, kNumber, Cumes, iterasyon, wait, waitStop, nCumeCounts, itr)
        _result = JSON.parse(result)
        Cumes = _result.Cumes
        iterasyon = _result.iterasyon
        itr = _result.itr
        wait = _result.wait
        waitStop = _result.waitStop
        nCumeCounts = _result.nCumeCounts

      }
      console.log("Hesaplanan Kümeleme", Cumes)
      console.log("Toplam İterasyon Sayısı : ", iterasyon)

      if (typeof fPoint != "undefined") {
        console.log(" ")
        let KNNResult = KNN(Cumes, fPoint)
        console.log(`X:${fPoint.x} Y:${fPoint.y} noktası ${KNNResult.K} Kümesine dahildir. En yakın Konşu Noktası ${KNNResult.NBRText} ve aradaki mesafe ${KNNResult.min_distance}.`)
        console.log(" ")
      }


      const diff = process.hrtime(startTime);
      time = (diff[0] * NS_PER_SEC + diff[1]);
      spinner.succeed(`Benchmark took ${diff[0] * NS_PER_SEC + diff[1]} nanoseconds`);
    } catch (error) {
      console.log("error", error)
    } finally {
      spinner.stop();
    }

    return time
  }

  const run = async () => {
    const { kNumber } = await inquirer.prompt([
      {
        type: 'input',
        name: 'kNumber',
        message: 'K Sayısını Giriniz :',
        default: 2,
      },
    ]);

    const timeWorker = await kMeansDataPrepare(kNumber, 'K');
    console.log(`Toplam Çalışma Süresi : ${Math.floor(timeWorker / 1000000)}ms`);
  };
  await run();

  function prepareData(count) {
    let data = []
    for (let i = 0; i < count; i++) {
      data.push({ x: (Math.random() * 100), y: (Math.random() * 100) })
    }
    return data
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
            console.log("selectedData", selectedData)
            Cumes.push([{ x: datas[selectedData].x, y: datas[selectedData].y }])
            findTr = false
          }
        }
      }
    }
    return Cumes
  }
})();