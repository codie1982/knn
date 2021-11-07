
(async () => {
    var express = require("express")
    var http = require("http")
    var bodyParser = require("body-parser")
    var path = require("path")
    const fs = require("fs")
    const app = express()
    const server = http.createServer(app)
    app.use(bodyParser.urlencoded({ extended: false }))
    //app.use(bodyParser.json())
    app.use('/static', express.static(path.join(__dirname, 'public')))
    app.get('/api/clusters', (req, res) => {
        const files = fs.readdirSync(path.join(__dirname, 'clusters'))
        let clusters = []
        for (let i = 0; i < files.length; i++) {
            let _file = files[i]
            let axises = _file.split("::")
            let _data = fs.readFileSync(`./clusters/${files[i]}`, { encoding: 'utf8', flag: 'r' });
            clusters.push({
                xaxis: axises[0],
                yaxis: axises[1],
                data: _data
            })
        }
        res.json(clusters)
    })
    app.get('/api/clusters/full', (req, res) => {
        const files = fs.readdirSync(path.join(__dirname, 'clusters'))
        let clusters = []
        for (let i = 0; i < files.length; i++) {
            const data = fs.readFileSync(`./cluster/${files[i]}`, { encoding: 'utf8', flag: 'r' });
            clusters.push({ file: files[i], data: JSON.parse(data) })
        }
        res.json(clusters)
    })

    app.get('/api/clusters/:id', (req, res) => {
        const selectedCluster = req.params.id
        const stream = fs.createReadStream(__dirname + "/" + "clusters" + "/" + selectedCluster)
        stream.pipe(res)
    })
    app.get('*', (req, res) => {
        res.sendFile(__dirname + "/" + "public/index.html");
    })
    server.listen(5001, () => console.log(`IBB Mobil Servis 5001 Port'u Üzerinde Çalışıyor`));
})()