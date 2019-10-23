let quotes = [
  {
    quote: 'I see dead people.',
    movie: 'The Sixth Sense',
    year: 1999,
    rating: 'PG-13',
  },
  {
    quote: 'May the force be with you.',
    movie: 'Star Wars: Episode IV - A New Hope',
    year: 1977,
    rating: 'PG',
  },
  {
    quote: "You've got to ask yourself one question: 'Do I feel lucky?' Well, do ya, punk?",
    movie: 'Dirty Harry',
    year: 1971,
    rating: 'R',
  },
  {
    quote: "You had me at 'hello.'",
    movie: 'Jerry Maguire',
    year: 1996,
    rating: 'R',
  },
  {
    quote: 'Just keep swimming. Just keep swimming. Swimming, swimming, swiming.',
    movie: 'Finding Nemo',
    year: 2003,
    rating: 'G',
  },
]

const newQuotes = [
  {
    quote: 'Houston, we have a problem.',
    movie: 'Apollo 13',
    year: 1995,
    rating: 'PG-13',
  },
  {
    quote: "Gentlemen, you can't fight in here! This is the war room!",
    movie: 'Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb',
    year: 1964,
    rating: 'PG',
  },
]
const colors = {
  G: '#3cff00',
  PG: '#f9ff00',
  'PG-13': '#ff9000',
  R: '#ff0000',
}

d3.select('#quotes')
  .style('list-style', 'none')
  .selectAll('li')
  .data(quotes)
  .enter()
  .append('li')
  .text(d => `"${d.quote}" - ${d.movie} (${d.year})`)
  .style('margin', '16px')
  .style('border', 'solid 1px black')
  .style('padding', '10px')
  // quote長度大於 25 個字元 16px, 其它 24px
  .style('font-size', d => (d.quote.length > 25 ? '16px' : '24px'))
  // 依據 colors 定義顏色比對渲染對應背景
  .style('background-color', d => colors[d.rating])

// 刪除
const removeBtn = d3.select('#remove')
removeBtn.on('click', () => {
  const excludeR = quotes.filter(movie => movie.rating !== 'R')

  d3.selectAll('li')
    .data(excludeR, d => d.quote)
    .exit()
    .remove()
})

// 新增
const addBtn = d3.select('#add')
addBtn.on('click', () => {
  quotes = quotes.concat(newQuotes)

  // d3 更新資料方法, 將 .enter 之前的狀態儲存
  const listItems = d3
    .select('#quotes')
    .selectAll('li')
    .data(quotes)

  listItems
    .enter()
    .append('li')
    .text(d => `"${d.quote}" - ${d.movie} (${d.year})`)
    .style('margin', '16px')
    .style('border', 'solid 1px black')
    .style('padding', '10px')
    .style('font-size', d => (d.quote.length > 25 ? '16px' : '24px'))
    .style('background-color', d => colors[d.rating])
    // 在使用 .merge 更新
    .merge(listItems)
    .style('color', 'green')

  // 將按鈕刪除
  addBtn.remove()
})
