/**
 * Chuẩn hóa chuỗi tiếng Việt về dạng không dấu, chữ thường
 * để tìm kiếm không phân biệt dấu (ví dụ "soi dong" khớp "Sôi Động").
 */
export function normalizeVietnamese(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim()
}

export function matchesSearch(haystack: string, query: string): boolean {
  if (!query) return true
  return normalizeVietnamese(haystack).includes(normalizeVietnamese(query))
}
