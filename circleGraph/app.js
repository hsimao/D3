let data = [[400, 200], [210, 140], [722, 300], [70, 160], [250, 50], [110, 280], [699, 225], [90, 220]]
const chartWidth = 800
const chartHeight = 400
const padding = 50

// Create SVG Element
const svg = d3
  .select('#chart')
  .append('svg')
  .attr('width', chartWidth)
  .attr('height', chartHeight)

// Create Scales
const scaleX = d3
  .scaleLinear()
  .domain([
    0,
    d3.max(data, function(d) {
      return d[0]
    }),
  ])
  .range([padding, chartWidth - padding * 2])

const scaleY = d3
  .scaleLinear()
  .domain([
    0,
    d3.max(data, function(d) {
      return d[1]
    }),
  ])
  .range([chartHeight - padding, padding])

// Create Axis Ｘ軸 底線
const axisX = d3.axisBottom(scaleX)

// 設置遮罩 clip paths, 讓 circle 的 g 屬性套用, 讓超出範圍的 circle 可被裁切
function createClipPath() {
  svg
    .append('clipPath')
    .attr('id', 'plot-area-clip-path')
    .append('rect')
    .attr('x', padding)
    .attr('y', padding)
    .attr('width', chartWidth - padding * 3)
    .attr('height', chartHeight - padding * 2)
}
createClipPath()

svg
  .append('g')
  .attr('class', 'x-axis')
  .attr('transform', 'translate(0,' + (chartHeight - padding) + ')')
  .call(axisX)

// Y軸  左直線
const axisY = d3.axisLeft(scaleY).ticks(5)

svg
  .append('g')
  .attr('class', 'y-axis')
  .attr('transform', 'translate( ' + padding + ', 0 )')
  .call(axisY)

// Create Circles
function createCircles() {
  svg
    .append('g')
    .attr('id', 'plot-area')
    .attr('clip-path', 'url(#plot-area-clip-path') // 遮罩配置, 讓超出範圍的 circles 可被裁切
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => scaleX(d[0]))
    .attr('cy', d => scaleY(d[1]))
    .attr('r', 15)
    .attr('fill', '#D1AB0E')
}
createCircles()

// Create Labels
function createLabels() {
  svg
    .append('g')
    .classed('labels', true)
    .selectAll('text')
    .data(data)
    .enter()
    .append('text')
    .text(d => d.join(', '))
    .attr('x', d => scaleX(d[0]))
    .attr('y', d => scaleY(d[1]))
}
createLabels()

// 產生隨機資料
function randomData() {
  const data = []
  const length = 8
  const maxNum = Math.random() * 1000

  for (let i = 0; i < length; i++) {
    const x = Math.floor(Math.random() * maxNum)
    const y = Math.floor(Math.random() * maxNum)
    data.push([x, y])
  }

  return data
}

function handleUpdateBtn() {
  d3.select('button').on('click', () => {
    const data = randomData()

    // 更新 svg 座標
    scaleX.domain([0, d3.max(data, d => d[0])])
    scaleY.domain([0, d3.max(data, d => d[1])])

    // 重新繪製 circle
    svg
      .selectAll('circle')
      .data(data)
      .transition()
      .duration(1000)
      .attr('cx', d => scaleX(d[0]))
      .attr('cy', d => scaleY(d[1]))

    // 重新繪製 Labels
    svg
      .selectAll('.labels text')
      .data(data)
      .transition()
      .duration(1000)
      .text(d => d.join(', '))
      .attr('x', d => scaleX(d[0]))
      .attr('y', d => scaleY(d[1]))

    // 更新 X, Y 軸線
    svg
      .select('.x-axis')
      .transition()
      .duration(600)
      .call(axisX)

    svg
      .select('.y-axis')
      .transition()
      .duration(600)
      .call(axisY)
  })
}
handleUpdateBtn()
