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
