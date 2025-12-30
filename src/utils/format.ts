export function vnNormalize(str: string | null | undefined) {
    if (!str) return null;
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')     // remove accents
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function generateSlug(input: string | null | undefined): string {
    if (!input) return crypto.randomUUID();
    return input
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')     // remove accents (Vietnamese safe)
        .replace(/đ/g, 'd')                  // Vietnamese-specific
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}