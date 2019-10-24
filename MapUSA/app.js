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

// 創建投影, 將 3D 地圖轉換成 2D
const projection = d3
  .geoAlbersUsa()
  .scale([chartWidth])
  .translate([chartWidth / 2, chartHeight / 2])

const path = d3.geoPath(projection)

// Create SVG
var svg = d3
  .select('#chart')
  .append('svg')
  .attr('width', chartWidth)
  .attr('height', chartHeight)

// data
d3.json('zombie-attacks.json').then(zombieData => {
  // 依據 zombie 資料的 num 數據來產生顏色
  mapColor.domain([d3.min(zombieData, d => d.num), d3.max(zombieData, d => d.num)])

  d3.json('us.json').then(usData => {
    usData.features.forEach((usE, usI) => {
      zombieData.forEach((zE, zI) => {
        // 如果 zombieData 資料跟 us 地圖資料名稱有吻合才將 num 資料寫入地圖
        if (usE.properties.name !== zE.state) return null
        usData.features[usI].properties.num = parseFloat(zE.num)
      })
    })

    // console.log(usData)

    svg
      .selectAll('path')
      .data(usData.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => makeFillColor(d, mapColor))
      .attr('stroke', strokeColor)
      .attr('stroke-width', strokeWidth)

    drawCities()
  })
})

// 繪製 city
function drawCities() {
  d3.json('us-cities.json').then(cityData => {
    svg
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
    svg
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

// 控制方向按鈕
d3.selectAll('#buttons button').on('click', function() {
  const offset = projection.translate()

  const distance = 100

  // 取得點擊當下按鈕得 class 來判斷方向
  const direction = d3.select(this).attr('class')
  if (direction === 'up') offset[1] -= distance
  if (direction === 'down') offset[1] += distance
  if (direction === 'left') offset[0] -= distance
  if (direction === 'right') offset[0] += distance

  // 更新投影位置
  projection.translate(offset)

  // 更新地圖
  svg
    .selectAll('path')
    .transition() // 加上 transition 增加平滑移動效果
    .attr('d', path)

  // 更新 city 圓圈
  svg
    .selectAll('circle')
    .transition()
    .attr('cx', d => projection([d.lon, d.lat])[0])
    .attr('cy', d => projection([d.lon, d.lat])[1])

  // 更新 city 文字
  svg
    .selectAll('text')
    .transition()
    .attr('x', d => projection([d.lon, d.lat])[0] - 18)
    .attr('y', d => projection([d.lon, d.lat])[1] + 3)
})
