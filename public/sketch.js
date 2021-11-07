

let input, button, greeting;
let nData;
let buttonW = 20;
let cluster;
let cluster_data;
let clusterdetail;
let width = 600, heigth = 600;
let woffset = 200
let hoffset = 500
let colors = {}
let colorsdetail = {}
let scaleX = 20
let scaleY = 20
async function setup() {
  // create canvas
  createCanvas(width, heigth);
  nData = new Data;
  cluster = await nData.getCluster()
  cluster_data = cluster.data
  console.log("cluster_data", cluster_data)
  background(200)

  for (let i = 0; i < cluster_data.length; i++) {
    button = createButton(i + 1);
    button.position((10 + buttonW) * (i + 1), 65);
    button.mousePressed(() => getData(i));
    for (let j = 0; j < cluster_data[i].length; j++) {
      if (typeof colors[i] != "undefined") {
        colors[i] = [...colors[i], {
          r: Math.round(Math.random() * 255),
          g: Math.round(Math.random() * 255),
          b: Math.round(Math.random() * 255),
        }]
      } else {
        colors[i] = [{
          r: Math.round(Math.random() * 255),
          g: Math.round(Math.random() * 255),
          b: Math.round(Math.random() * 255),
        }]
      }

    }
  }
  greeting = createElement('h4', `${cluster_data.length} adet işlenmiş veri bulunmaktadır.`);
  greeting.position(20, 5);

  textAlign(CENTER);
  textSize(50);
}
async function getData(index) {
  clusterdetail = cluster_data[index]
  colorsdetail = colors[index]
}
function draw() {
  background(100)
  grid()
  if (typeof clusterdetail != "undefined") {
    for (let i = 0; i < clusterdetail.length; i++) {
      fill(colorsdetail[i].r, colorsdetail[i].g, colorsdetail[i].b)
      for (let j = 0; j < clusterdetail[i].length; j++) {
        let X = parseInt(clusterdetail[i][j].x) * scaleX
        let Y = parseInt(clusterdetail[i][j].y) * -1 * scaleY
        circle(X + woffset, Y + hoffset, 20)
      }
    }
  }
}
function grid() {
  stroke(100, 153, 255);
  let count = 50;
  let wCount = (heigth / count)
  let hCount = (width / count)
  for (let i = 0; i < wCount; i++) {
    line(0, count * (i + 1), width, count * (i + 1));
  }
  for (let i = 0; i < hCount; i++) {
    line(count * (i + 1), 0, count * (i + 1), heigth);
  }

}
