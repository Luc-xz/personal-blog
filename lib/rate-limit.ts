interface RateLimitStore {
  [key: string]: { count: number; resetTime: number }
}

const store: RateLimitStore = {}

export interface RateLimitOptions {
  windowMs: number // 时间窗口（毫秒）
  maxRequests: number // 最大请求数
}

export function rateLimit(identifier: string, options: RateLimitOptions): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const { windowMs, maxRequests } = options
  
  // 清理过期记录
  if (store[identifier] && now > store[identifier].resetTime) {
    delete store[identifier]
  }
  
  // 初始化或获取当前记录
  if (!store[identifier]) {
    store[identifier] = {
      count: 0,
      resetTime: now + windowMs
    }
  }
  
  const record = store[identifier]
  record.count++
  
  const allowed = record.count <= maxRequests
  const remaining = Math.max(0, maxRequests - record.count)
  
  return {
    allowed,
    remaining,
    resetTime: record.resetTime
  }
}

// 清理过期记录（定期调用）
export function cleanupExpiredRecords() {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (now > store[key].resetTime) {
      delete store[key]
    }
  })
}

// 获取客户端 IP（用于限流标识）
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}
