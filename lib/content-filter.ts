// 简易敏感词过滤器
const sensitiveWords = [
  '垃圾', '广告', '推广', '加微信', '加QQ', '刷单', '兼职', '赚钱',
  '色情', '暴力', '政治', '反动', '邪教', '赌博', '毒品',
  // 可根据需要扩展
]

export function containsSensitiveWords(content: string): boolean {
  const lowerContent = content.toLowerCase()
  return sensitiveWords.some(word => lowerContent.includes(word.toLowerCase()))
}

export function filterSensitiveWords(content: string): string {
  let filtered = content
  sensitiveWords.forEach(word => {
    const regex = new RegExp(word, 'gi')
    filtered = filtered.replace(regex, '*'.repeat(word.length))
  })
  return filtered
}

// 检查是否为垃圾评论（简单规则）
export function isSpamComment(content: string, author: string, email?: string): boolean {
  // 内容过短或过长
  if (content.length < 2 || content.length > 1000) return true
  
  // 包含敏感词
  if (containsSensitiveWords(content)) return true
  
  // 重复字符过多
  if (/(.)\1{10,}/.test(content)) return true
  
  // 链接过多
  const linkCount = (content.match(/https?:\/\//g) || []).length
  if (linkCount > 2) return true
  
  // 作者名包含敏感词
  if (containsSensitiveWords(author)) return true
  
  return false
}

// 生成简易验证码
export function generateCaptcha(): { question: string; answer: string } {
  const operations = [
    { op: '+', fn: (a: number, b: number) => a + b },
    { op: '-', fn: (a: number, b: number) => a - b },
    { op: '×', fn: (a: number, b: number) => a * b }
  ]
  
  const operation = operations[Math.floor(Math.random() * operations.length)]
  const a = Math.floor(Math.random() * 10) + 1
  const b = Math.floor(Math.random() * 10) + 1
  
  // 确保减法结果为正数
  if (operation.op === '-' && a < b) {
    return generateCaptcha()
  }
  
  const answer = operation.fn(a, b).toString()
  const question = `${a} ${operation.op} ${b} = ?`
  
  return { question, answer }
}
