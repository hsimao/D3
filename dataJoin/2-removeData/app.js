const quotes = [
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

// 更新資料, 改用新的陣列
const excludeR = quotes.filter(movie => movie.rating !== 'R')

d3.selectAll('li')
  .data(excludeR, d => d.quote) // 第二個參數要回傳唯一值當 key
  .exit()
  .remove()
