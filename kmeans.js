const worker = require('./kmeans-worker');
const { KNN, searchPoint } = require('./util/util');
const inquirer = require('inquirer');
const ora = require('ora');
const fs = require('fs')
const path = require("path")
const readline = require('readline');
const reader = require("readline-sync");
const { json } = require('body-parser');
(async () => {
  const DELEMITER = ","
  const NS_PER_SEC = 1e9;
  const kMeansDataPrepare = (datas, Clusters, kNumber, label) => {
    return new Promise((resolve, reject) => {
      (async () => {
        const spinner = ora(`Calculating with ${label}..`).start();
        let time;
        let itr = true;
        let iterasyon = 0
        let wait = 0
        let waitStop = 1
        let _result;

        try {
          const startTime = process.hrtime();
          let nClusterCounts = []
          while (itr) {
            result = await worker(datas, kNumber, Clusters, iterasyon, wait, waitStop, nClusterCounts, itr)
            _result = JSON.parse(result)
            Clusters = _result.Clusters
            iterasyon = _result.iterasyon
            itr = _result.itr
            wait = _result.wait
            waitStop = _result.waitStop
            nClusterCounts = _result.nClusterCounts
          }
          const diff = process.hrtime(startTime);
          time = (diff[0] * NS_PER_SEC + diff[1]);
          spinner.succeed(`Benchmark took ${diff[0] * NS_PER_SEC + diff[1]} nanoseconds`);
        } catch (error) {
          reject(error)
        } finally {
          spinner.stop();
        };
        resolve({ clusters: Clusters, iterasyon })
      })()
    })
  }
  function setLine(fileL) {
    let totalLine = 35
    let lastline = totalLine - fileL
    let line = "-"
    for (let l = 0; l < lastline; l++) {
      line += "-"
    }
    return line
  }

  function selectedFile(path) {
    const files = fs.readdirSync(path)
    let idx = 0
    //birden fazla seçim yaptıralım
    //10'dan fazla ise uyarı verelim
    if (files.length == 1) {
      idx = 0
    } else {
      console.log("------------------------------------------------------")
      console.log("Birden fazla dosya var hangisini seçmek istiyorsunuz?")
      console.log("------------------------------------------------------")

      for (let i = 0; i < files.length; i++) {
        let _i = i + 1
        let line = setLine(files[i].length)
        console.log(`${files[i]} ${line} ${_i}`)
        console.log("")
      }
      let _idx = reader.question("Yukarıdaki listeye göre bir seçim yapabilirsiniz.");
      idx = _idx - 1
    }
    return files[idx]
  }
  async function prepareData(filename) {
    if (typeof filename == "undefined") return;
    let _dt = {}
    let _bdata = {}
    let _data = []
    let clustername = ""

    let _filename = filename.split(".").splice(0, 1).join(".")

    let file = "data" + "/" + filename
    let KmeansData = await setKmeansdata(file)

    const title = KmeansData[0].split(DELEMITER)
    let selectX = ""
    let selectXIndex = 0
    let selectY = ""
    let selectYIndex = 0
    if (title.length > 2) {
      //birden fazla alan var hangi alanların seçimlerinn ypılamsını istediğini sormamız gerekli
      //isterse tüm alanlar diyerek tüm alanların birbiri ile korelasyonu yapılmasını isteyebiliriz.
      console.log("Birden fazla başlık var korelasyona sokmak istediğiniz başlıkları seçebilirsiniz.")
      let selectCount = 0
      let itr = true
      for (let t = 0; t < title.length; t++) {
        let _t = t + 1
        let titlename = title[t]
        let line = setLine(titlename.length)
        console.log(`${title[t]} ${line} ${_t}`)
        console.log("")
      }
      //iki den fazla başlık var ise korelasyona sokulacak iki başlık seçilmesi isteniyor
      while (itr) {
        console.log(selectCount == 1 && `Seçilen kolon ${title[selectXIndex]} `)
        let srt = selectCount == 0 ? "Birinci kolonu seçin/n :" : "İkinci kolonu seçin/n : "
        let index = reader.question(srt);
        if (index == "") {
          console.clear()
          console.log("Seçilen değeri boş olmamalı. Lütfen tekrar seçim yapın")
        } else {
          if (index > title.length) {
            console.clear()
            console.log(`Seçilen seçilen değer ${title.length} değerinden büyük olmamalı`)
          } else {
            if (selectCount == 0) {
              selectXIndex = index - 1
            } else if (selectCount == 1) {
              selectYIndex = index - 1
            }
            selectCount++
            if (selectCount > 1) {
              if (selectXIndex == selectYIndex) {
                console.clear()
                console.log("iki durum içinde aynı kolonu seçtiniz. Tekrar iki farklı kolon seçmeyi deneyiniz")
                selectXIndex = 0
                selectYIndex = 0
                selectCount = 0
              }
            }
            if (selectCount == 2) itr = false
          }
        }
      }
    } else {
      selectXIndex = 0 //iki başlık varsa sırası ile 0 ve 1 içerikleri alınıyor
      selectYIndex = 1
    }
    selectX = title[selectXIndex]
    selectY = title[selectYIndex]
    clustername = selectX.split(" ").join("_") + "::" + selectY.split(" ").join("_") + "::" + "cluster_" + _filename + "_corelations" + "." + "cls"
    for (let i = 1; i < KmeansData.length; i++) {
      let _parse = KmeansData[i].split(DELEMITER)
      _dt = parseData(_parse[selectXIndex], _parse[selectYIndex])
      _data.push(_dt)
    }
    return { data: _data, clustername: clustername }
  }

  async function formatKmeansdata(data) {
    return new Promise((resolve, reject) => {
      (async () => {
        let _dt = {}
        let _data = []
        const parse = data[0].split(DELEMITER)
        if (parse.length > 2) {
          console.log("Tüm korelasyon yapılsın")
        } else {
          for (let i = 1; i < data.length; i++) {
            let _parse = data[i].split(DELEMITER)
            _dt = parseData(_parse[0], _parse[1])
            _data.push(_dt)
          }
        }
        resolve(_data)
      })()
    })
  }

  function parseData(X, Y) {
    let dt = {}
    dt["x"] = X
    dt["y"] = Y
    return dt
  }
  async function setKmeansdata(file) {
    return new Promise((resolve, reject) => {
      (async () => {
        let _dt = []
        console.log("file", file)
        const rl = readline.createInterface({
          input: fs.createReadStream(file),
        });
        for await (const line of rl) {
          // Each line in input.txt will be successively available here as `line`.
          _dt.push(line)
        }
        resolve(_dt)
      })()
    })
  }
  function prepareCluster(K, datas) {
    let Clusters = []
    if (typeof datas == "undefined") {
      for (let i = 0; i < K; i++) {
        Clusters.push([{ x: (Math.random() * 100), y: (Math.random() * 100) }])
      }
    } else {
      for (let i = 0; i < K; i++) {
        let findTr = true
        while (findTr) {
          let selectedData = Math.floor(Math.random() * datas.length)
          if (!searchPoint(datas, selectedData)) {
            Clusters.push([{ x: datas[selectedData].x, y: datas[selectedData].y }])
            findTr = false
          }
        }
      }
    }
    return Clusters
  }
  const run = async (datas, clustername, Clusters, K) => {
    return new Promise((resolve, reject) => {
      (async () => {
        await kMeansDataPrepare(datas, Clusters, K, 'K').then(result => {
          resolve(result.clusters)
        })
          .catch(err => console.log("HATA : ", err));
      })()
    })
  };

  async function main() {
    let datas;
    let preData;
    let clustername;
    let turn = true
    let clusters = null;
    let record = []
    let addFile = true
    console.clear()
    console.log("****************************************************************************\n")
    console.log("* Merhaba Kullanıcı;                                                       *\n")
    console.log("* K-Means ile ortalama mesafe ile sınıflandırma yapma programına hoşgeldin.*\n")
    console.log("* Aşağıdaki menuden ne yapmak istediğini seçebilirsin.                     *\n")
    menu(false)
    console.log("****************************************************************************\n")




    while (turn) {
      let action = reader.question("Eylem Seçim: ");
      switch (parseInt(action)) {
        case 1:
          preData = await prepareData(selectedFile(__dirname + "/data"))
          datas = preData.data
          clustername = preData.clustername
          menu()
          console.log("Data Hazırlandı")
          break;
        case 2:
          if (typeof datas != "undefined") {
            let kNumber = reader.question("Bir K sayısı seçimi yapın: ");
            let preClusters = prepareCluster(kNumber, datas)
            /* let preClusters = []
            preClusters.push([{ x: 1, y: 0 }])
            preClusters.push([{ x: 10, y: 255 }]) */

            clusters = await run(datas, clustername, preClusters, kNumber)
            record.push({ filename: clustername, data: JSON.stringify(clusters) })
          } else {
            console.log("Öncelikle data hazırlanması gerekmektedir.")
          }
          break;
        case 3:
          console.clear()
          //öncelikle record datası kontrol edilir bu şekide program içinde hazırda bekleyen bir data var ise işleme o data ile başlanır.
          let file = selectedFile(__dirname + "/clusters")
          console.log("files", file)
          if (file.length === 0) {
            console.log("/clusters Klasöründe herhangi bir veri bulunmuyorF")
          } else {
            let KmeansData = await setKmeansdata(__dirname + "/clusters" + "/" + file)
            let clusters = JSON.parse(KmeansData)
            console.log("clusters", clusters)
            if (clusters != null) {
              let result = KNN(clusters, { x: 2, y: 255 }, 3)
            } else {
              console.log("Öncelikle Kümelemelri hesaplamak gerekiyor..")
            }
          }
          break;
        case 9:
          console.clear()
          turn = false
          console.log("Belirttiğiniz alanda bir eylem bulunmamaktadır. Lütfen menuden bir seçim Programdan çıkış yapılıyor\n");
        default:
          console.log("Belirttiğiniz alanda bir eylem bulunmamaktadır. Lütfen menuden bir seçim yapınız.\n")
          menu()
          break;
      }
    }
    if (addFile) {
      if (record.length != 0) {
        for (let r = 0; r < record.length; r++) {
          fs.writeFile(__dirname + "/clusters" + "/" + record[r].filename, record[r].data, (err) => {
            if (err) return console.log(err);
            console.log("Dosya Yazıldı")
          });
        }
      }
    }
  }
  function menu(clearScreen = true) {
    if (clearScreen) console.clear()
    console.log("Data Hazırla -------------------------- 1\n")
    console.log("Kümeleme Oluştur(K-Means) ------------- 2\n")
    console.log("Veri Sınıflama (KNN) ------------------ 3\n")
    console.log("Çıkış --------------------------------- 9\n")
  }
  await main()
})();