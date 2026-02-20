/**
 * Central fetch wrapper for all CGPO API calls.
 * Injects the Modal bypass header, API key, and enforces a 15-second timeout.
 */
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";

export async function apiFetch(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<Response> {
    const headers = new Headers(init?.headers);
    headers.set("X-Modal-Bypass-Interstitial", "true");
    if (API_KEY) headers.set("X-API-Key", API_KEY);

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
