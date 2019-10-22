const world = '//unpkg.com/world-atlas@1.1.4/world/50m.json'
const china = './china.json'

d3.queue()
  // 地圖 geoJson
  .defer(d3.json, china)
  // 本地人口資料 csv
  .defer(d3.csv, './country_data.csv', row => {
    return {
      country: row.country,
      countryCode: row.countryCode,
      population: +row.population,
      medianAge: +row.medianAge,
      fertilityRate: +row.fertilityRate,
      populationDensity: +row.population / +row.landArea,
    }
  })
  .await((error, mapData, populationData) => {
    if (error) throw error
    console.log('mapData', mapData)

    // const geoData = topojson.feature(mapData, mapData.objects.countries).features

    const geoData = mapData.features
    console.log('geoData', geoData)

    // 本地 csv 資料 loop
    populationData.forEach(row => {
      // 匹配地圖 json 格式上的國家 id, 獨立儲存到 countries
      const countries = geoData.filter(d => d.id === row.countryCode)

      // 將對應 csv 資料塞進 countries
      countries.forEach(country => (country.properties = row))
    })

    // 地圖 svg setting
    const width = 960
    const height = 600

    // d3 繪製地圖
    const projection = d3
      .geoMercator()
      // .scale(300)
      // .translate([width / 2, height / 1.4])
      .scale(700)
      .translate([-850, 800])

    const path = d3.geoPath().projection(projection)

    debugger

    d3.select('svg')
      .attr('width', width)
      .attr('height', height)
      .selectAll('.country')
      .data(geoData)
      .enter()
      .append('path')
      .classed('country', true)
      .attr('d', path)

    // 監聽 select, 改變顏色
    const select = d3.select('select')
    select.on('change', d => setColor(d3.event.target.value))

    setColor(select.property('value'))

    function setColor(val) {
      const colorRanges = {
        31: ['white', 'purple'], // 上海
        12: ['white', 'red'], // 天津市
        11: ['white', 'black'], // 北京市
        71: ['white', 'orange'], // 台灣
        63: ['white', 'green'], // 青海省
      }

      const scale = d3
        .scaleLinear()
        .domain([0, d3.max(geoData, d => d.properties.id === val)])
        .range(colorRanges[val])

      d3.selectAll('.country')
        .transition()
        .duration(600)
        .ease(d3.easeBackIn)
        .attr('fill', d => {
          if (d.properties.id === val) {
            return scale(colorRanges[val])
          } else {
            return '#ccc'
          }
        })
    }
  })
