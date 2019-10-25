const data = [6, 20, 21, 14, 2, 30, 7, 16, 25, 5, 11, 28, 10, 26, 9]

// Create SVG Element
const chartWidth = 800
const chartHeight = 400
const barPadding = 0.05 // 5 %
const fillColor = '#7ED26D'

// 產生 x 軸與 width 算換公式
const scaleX = d3
  .scaleBand()
  .domain(d3.range(data.length))
  .rangeRound([0, chartWidth])
  .paddingInner(barPadding)

// 產生 y 軸與 height 算換公式
const scaleY = d3
  .scaleLinear()
  .domain([0, d3.max(data)])
  .range([0, chartHeight])

const svg = d3
  .select('#chart')
  .append('svg')
  .attr('width', chartWidth)
  .attr('height', chartHeight)

// Bind Data and create bars
function drawLineGraph(target, data) {
  target
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', (d, i) => scaleX(i)) // 使用 scaleX 換算 x 軸位置
    .attr('y', d => chartHeight - scaleY(d)) // 使用 scaleY 換算 y 軸位置
    .attr('height', d => scaleY(d)) // 使用 scaleY 換算高度
    .attr('width', scaleX.bandwidth()) // 使用 scaleX 換算平均寬度
    .attr('fill', fillColor)
}
drawLineGraph(svg, data)

function drawText(target, data) {
  target
    .selectAll('text')
    .data(data)
    .enter()
    .append('text')
    .text(d => d)
    .attr('x', (d, i) => scaleX(i) + scaleX.bandwidth() / 2) // 使用 scaleX 換算文字 x 軸位置
    .attr('y', d => chartHeight - scaleY(d) + 15) // 使用 scaleY 換算文字 y 軸位置
    .attr('font-size', 14)
    .attr('fill', '#fff')
    .attr('text-anchor', 'middle') // 文字左右置中
}
drawText(svg, data)

// 更新直線圖, 資料反轉後更新
function handleUpdateBtn() {
  d3.select('button').on('click', () => {
    data.reverse()

    // 重新繪製有資料變動的 svg 線條圖
    svg
      .selectAll('rect')
      .data(data)
      // 重新繪製高度
      .transition()
      .delay((d, i) => (i / data.length) * 1000) // 逐一延遲, 全部延遲 1000 毫秒, 平均分配
      .duration(600)
      .ease(d3.easeCubicInOut)
      .attr('y', d => chartHeight - scaleY(d))
      .attr('height', d => scaleY(d))

    // 重新繪製有變動的 text
    svg
      .selectAll('text')
      .data(data)
      .transition()
      .delay((d, i) => (i / data.length) * 1000) // 逐一延遲, 全部延遲 1000 毫秒, 平均分配
      .duration(600)
      .ease(d3.easeCubicInOut)
      .text(d => d)
      .attr('x', (d, i) => scaleX(i) + scaleX.bandwidth() / 2)
      .attr('y', d => chartHeight - scaleY(d) + 15)
  })
}
handleUpdateBtn()
