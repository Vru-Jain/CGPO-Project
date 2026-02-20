/**
 * Central fetch wrapper for all CGPO API calls.
 * Automatically injects the Modal bypass header (prevents 303 redirect loops
 * on cold-start) and enforces a sensible request timeout.
 */
export async function apiFetch(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<Response> {
    const headers = new Headers(init?.headers);
    headers.set("X-Modal-Bypass-Interstitial", "true");

    // Default 15-second timeout — prevents silent hangs when the GPU is warming up
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    try {
        return await fetch(input, {
            ...init,
            headers,
            signal: init?.signal ?? controller.signal,
        });
    } finally {
        clearTimeout(timeoutId);
    }
}
