/**
 * Safe server-side API fetch utility
 * Used in SSR pages to fetch data without causing redirects on 401/403 errors
 * 
 * Usage:
 * const data = await safeFetch(`/api/endpoint`, headers);
 * if (!data) {
 *   // API error or 401/403 - show error state or empty data
 * }
 */

import { APIURL } from "@/utils/api-address";

interface SafeFetchOptions {
  headers?: Record<string, string>;
}

export async function safeFetch(
  endpoint: string,
  options?: SafeFetchOptions
) {
  try {
    const url = `${APIURL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    };

    const response = await fetch(url, {
      method: "GET",
      headers,
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    // If 401/403, return null - don't throw or redirect
    if (response.status === 401 || response.status === 403) {
      console.warn(`Auth error ${response.status} for ${endpoint}`);
      return null;
    }

    // If other errors, return null
    if (!response.ok) {
      console.error(`API error ${response.status} for ${endpoint}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API fetch failed for ${endpoint}:`, error);
    return null;
  }
}

/**
 * Fetch multiple endpoints in parallel
 * Returns array with null for failed requests
 */
export async function safeMultiFetch(
  endpoints: Array<{ url: string; options?: SafeFetchOptions }>
) {
  return Promise.all(
    endpoints.map((ep) => safeFetch(ep.url, ep.options))
  );
}
