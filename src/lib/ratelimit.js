import 'server-only'

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const limiterCache = new Map()
let redisClient

function getRedisClient() {
  if (redisClient !== undefined) {
    return redisClient
  }

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    redisClient = null
    return redisClient
  }

  redisClient = new Redis({ url, token })
  return redisClient
}

function getLimiter(cacheKey, requests, window) {
  if (limiterCache.has(cacheKey)) {
    return limiterCache.get(cacheKey)
  }

  const redis = getRedisClient()
  const limiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(requests, window),
        prefix: cacheKey,
      })
    : null

  limiterCache.set(cacheKey, limiter)
  return limiter
}

export function getStatusCreateLimiter() {
  return getLimiter('ratelimit:status-create', 5, '15 m')
}

export function getStatusConfirmLimiter() {
  return getLimiter('ratelimit:status-confirm', 20, '15 m')
}

export function getCommentCreateLimiter() {
  return getLimiter('ratelimit:comment-create', 10, '15 m')
}

export function getCommentUpvoteLimiter() {
  return getLimiter('ratelimit:comment-upvote', 40, '15 m')
}

export async function enforceRateLimit(limiter, identifier) {
  if (!limiter) {
    throw new Error('Server is missing Upstash rate limit configuration.')
  }

  return limiter.limit(identifier)
}
