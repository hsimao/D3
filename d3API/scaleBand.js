const fruit = ['Apples', 'Oranges', 'Grapes', 'Strawberry', 'Kiwi']

const scale = d3
  .scaleBand()
  // .domain(fruit) // 直接用資料來產生, 只能用參數索引 scale('Apples')
  .domain(d3.range(fruit.length)) // 使用資料長度並用 d3.range 來產生索引 key id
  .range([0, 100])

// scale(0) => 0
// scale(1) => 20
// scale(2) => 40
// scale(3) => 60
// scale(4) => 80
