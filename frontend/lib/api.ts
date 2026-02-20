/**
 * Wrapper around the native fetch API to automatically inject headers required
 * for bypassing the ngrok browser warning screen when hitting the Colab backend.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const headers = new Headers(init?.headers);
    headers.set('ngrok-skip-browser-warning', '69420');
    headers.set('X-Modal-Bypass-Interstitial', 'true');

    return fetch(input, {
        ...init,
        headers,
    });
}
