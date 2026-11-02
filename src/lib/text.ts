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

/**
 * Viết hoa chữ cái đầu của mỗi từ (ví dụ "nồng nàn hà nội" -> "Nồng Nàn Hà Nội").
 * Giữ nguyên phần còn lại của từ để không làm hỏng tên viết tắt như "M-TP", "US-UK".
 */
export function capitalizeWords(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toLocaleUpperCase('vi') + word.slice(1))
    .join(' ')
}
