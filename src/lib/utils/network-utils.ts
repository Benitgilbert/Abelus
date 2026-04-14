/**
 * Utilities for high-fidelity network resilience and exponential backoff retries.
 * Optimized for mobile-first environments where network dips are frequent.
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 8000,
  factor: 2,
};

/**
 * Retries an asynchronous operation with exponential backoff.
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries, initialDelay, maxDelay, factor } = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
  };

  let lastError: any;
  let currentDelay = initialDelay!;

  for (let attempt = 0; attempt <= maxRetries!; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // If we've reached max retries, don't wait, just throw
      if (attempt === maxRetries) break;

      // Log the retry for development awareness
      console.warn(
        `[Network Resilience] Attempt ${attempt + 1} failed. Retrying in ${currentDelay}ms...`,
        error.message || error
      );

      // Wait for the specified delay
      await new Promise((resolve) => setTimeout(resolve, currentDelay));

      // Calculate next delay
      currentDelay = Math.min(currentDelay * factor!, maxDelay!);
    }
  }

  throw lastError;
}

/**
 * Executes a Supabase query with built-in resilience.
 * Returns null if all retries fail, preventing app crashes.
 */
export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  fallback: T | null = null
): Promise<T | null> {
  try {
    return await retryOperation(async () => {
      const { data, error } = await queryFn();
      if (error) throw error;
      return data;
    });
  } catch (err) {
    console.error('[Network Resilience] Fatal connection error after retries:', err);
    return fallback;
  }
}
