type AttemptEntry = {
  count: number;
  resetAt: number;
};

const attempts = new Map<string, AttemptEntry>();
const WINDOW_MS = 1000 * 60 * 15;
const MAX_ATTEMPTS = 10;

function cleanup(now: number) {
  for (const [key, entry] of attempts.entries()) {
    if (entry.resetAt <= now) {
      attempts.delete(key);
    }
  }
}

export function consumeRateLimit(key: string) {
  const now = Date.now();
  cleanup(now);

  const existing = attempts.get(key);

  if (!existing || existing.resetAt <= now) {
    attempts.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });

    return {
      allowed: true,
      remaining: MAX_ATTEMPTS - 1,
      resetAt: now + WINDOW_MS,
    };
  }

  if (existing.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  attempts.set(key, existing);

  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - existing.count,
    resetAt: existing.resetAt,
  };
}

export function clearRateLimit(key: string) {
  attempts.delete(key);
}
