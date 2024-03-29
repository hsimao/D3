const chartWidth = 800
const chartHeight = 600
const fillColor = '#58cce1'
const strokeColor = '#fff'
const strokeWidth = 1
const mapColor = d3
  .scaleQuantize()
  .range([
    'rgb(255,245,240)',
    'rgb(254,224,210)',
    'rgb(252,187,161)',
    'rgb(252,146,114)',
    'rgb(251,106,74)',
    'rgb(239,59,44)',
    'rgb(203,24,29)',
    'rgb(165,15,21)',
    'rgb(103,0,13)',
  ])

// 依據 mapColor 顏色區間, 跟當下 loop 給的 val 值產生對應顏色
// 用法 .attr('fill', d => makeFillColor(d, mapColor))
function makeFillColor(val, colors) {
  const num = val.properties.num
  return num ? colors(num) : '#ddd'
}

let projection, path, svg, map, drapMap

function mapInit() {
  // 創建投影, 將 3D 地圖轉換成 2D
  projection = d3.geoAlbersUsa().translate([0, 0])

  path = d3.geoPath(projection)

  // Create SVG
  svg = d3
    .select('#chart')
    .append('svg')
    .attr('width', chartWidth)
    .attr('height', chartHeight)

  map = svg
    .append('g')
    .attr('id', 'map')
    .call(handleZoomAndDrag()) // 綁定拖曳、縮放事件
    .call(handleZoomAndDrag().transform, d3.zoomIdentity.translate(chartWidth / 2, chartHeight / 2).scale(1))

  // 繪製滿版的 rect svg 讓整個畫面都可觸發拖曳效果
  drawFullRect()
  drawMap()
  handleDirectionButton()
  handleZoomButton()
}
mapInit()

// 繪製滿版 rect svg
function drawFullRect() {
  map
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', chartWidth)
    .attr('height', chartHeight)
    .attr('opacity', 0)
}

// 產生繪製地圖的資料
function makeMapData() {
  return new Promise((resolve, reject) => {
    d3.json('zombie-attacks.json')
      .then(zombieData => {
        // 依據 zombie 資料的 num 數據來產生顏色
        mapColor.domain([d3.min(zombieData, d => d.num), d3.max(zombieData, d => d.num)])

        d3.json('us.json')
          .then(usData => {
            usData.features.forEach((usE, usI) => {
              zombieData.forEach((zE, zI) => {
                // 如果 zombieData 資料跟 us 地圖資料名稱有吻合才將 num 資料寫入地圖
                if (usE.properties.name !== zE.state) return null
                usData.features[usI].properties.num = parseFloat(zE.num)
              })
            })

            resolve(usData.features)
          })
          .catch(err => reject(err))
      })
      .catch(err => reject(err))
  })
}

// 繪製地圖
async function drawMap() {
  const data = await makeMapData()
  if (!data) return

  map
    .selectAll('path')
    .data(data)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('fill', d => makeFillColor(d, mapColor))
    .attr('stroke', strokeColor)
    .attr('stroke-width', strokeWidth)

  drawCities()
}

// 繪製 city
function drawCities() {
  d3.json('us-cities.json').then(cityData => {
    map
      .selectAll('circle')
      .data(cityData)
      .enter()
      .append('circle')
      .style('fill', '#9d497a')
      .style('opacity', 0.8)
      // 使用 projection 轉換資料座標
      .attr('cx', d => projection([d.lon, d.lat])[0])
      .attr('cy', d => projection([d.lon, d.lat])[1])
      // 依據資料 population 來換算圓圈半徑
      .attr('r', d => Math.sqrt(parseInt(d.population) * 0.00005))

    // 顯示文字
    map
      .selectAll('text')
      .data(cityData)
      .enter()
      .append('text')
      .attr('x', d => projection([d.lon, d.lat])[0] - 18)
      .attr('y', d => projection([d.lon, d.lat])[1] + 3)
      .text(d => d.city)
      .style('font-size', '10')
      .attr('fill', fillColor)
  })
}

// 單一拖曳事件 - 目前沒用到
function handleDrag() {
  return d3.drag().on('drag', () => {
    const offset = projection.translate()
    offset[0] += d3.event.dx
    offset[1] += d3.event.dy

    // 更新投影位置
    projection.translate(offset)
    updateMap()
  })
}

// 縮放、拖曳事件
function handleZoomAndDrag() {
  return d3
    .zoom()
    .scaleExtent([0.5, 3.0]) // 限制縮放範圍
    .translateExtent([[-1000, -500], [1000, 500]]) // 限制移動範圍
    .on('zoom', function() {
      const offset = [d3.event.transform.x, d3.event.transform.y]
      const scale = d3.event.transform.k * 2000
      // 更新投影位置
      projection.translate(offset).scale(scale)
      updateMap()
    })
}

// 控制方向按鈕
function handleDirectionButton() {
  d3.selectAll('#buttons button').on('click', function() {
    const distance = 100
    let x = 0
    let y = 0

    // 取得點擊當下按鈕得 class 來判斷方向
    const direction = d3.select(this).attr('class')
    if (direction === 'up') y -= distance
    if (direction === 'down') y += distance
    if (direction === 'left') x -= distance
    if (direction === 'right') x += distance

    map.transition().call(handleZoomAndDrag().translateBy, x, y)
    updateMap()
  })
}

// 縮放控制按鈕
function handleZoomButton() {
  d3.selectAll('#buttons .zooming').on('click', function() {
    let scale = 1

    const direction = d3
      .select(this)
      .attr('class')
      .replace('zooming', '')
      .trim()

    if (direction === 'in') scale = 1.25
    if (direction === 'out') scale = 0.75

    map.transition().call(handleZoomAndDrag().scaleBy, scale)
    updateMap()
  })
}

// 更新
function updateMap() {
  // 更新地圖
  svg.selectAll('path').attr('d', path)

  // 更新 city 圓圈
  svg
    .selectAll('circle')
    .attr('cx', d => projection([d.lon, d.lat])[0])
    .attr('cy', d => projection([d.lon, d.lat])[1])

  // 更新 city 文字
  svg
    .selectAll('text')
    .attr('x', d => projection([d.lon, d.lat])[0] - 18)
    .attr('y', d => projection([d.lon, d.lat])[1] + 3)
}
