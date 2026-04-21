export async function apiCall<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
    }
    return res.json() as Promise<T>;
}
