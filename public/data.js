

function Data() {
    this.getCluster = async () => {
        const result = await fetch("/api/clusters")
        const clusterList = await result.json()
        console.log("clusterList", clusterList)

        
        return {
            xAxis: clusterList.xaxis,
            yAxis: clusterList.yaxis,
            data: clusterList.map(item => JSON.parse(item.data))
        }
    }
    this.getDetail = async (item) => {
        if (typeof item != "undefined") {
            const result = await fetch(`/api/clusters/${item}`)
            const clusterDetailData = await result.json()
            return clusterDetailData
        }
    }
    this.getFullDetail = async (item) => {
        if (typeof item != "undefined") {
            const result = await fetch(`/api/clusters/full`)
            const clusterDetailData = await result.json()
            return clusterDetailData
        }
    }
}