type RateLimitInput = {
  key: string
  limit: number
  windowMs: number
}

type RateLimitResult = {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

const requestsByKey = new Map<string, number[]>()

export function checkRateLimit(input: RateLimitInput): RateLimitResult {
  const now = Date.now()
  const windowStart = now - input.windowMs

  const existing = requestsByKey.get(input.key) ?? []
  const active = existing.filter((timestamp) => timestamp > windowStart)

  if (active.length >= input.limit) {
    const earliest = active[0] ?? now
    const retryAfterSeconds = Math.max(1, Math.ceil((earliest + input.windowMs - now) / 1000))

    requestsByKey.set(input.key, active)
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    }
  }

  active.push(now)
  requestsByKey.set(input.key, active)

  return {
    allowed: true,
    remaining: Math.max(0, input.limit - active.length),
    retryAfterSeconds: 0,
  }
}
