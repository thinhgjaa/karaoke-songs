import { capitalizeWords } from './text'

/** Lấy video ID từ các dạng link YouTube phổ biến để hiển thị thumbnail. */
export function getYoutubeVideoId(url: string): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1).split('/')[0] || null
    }
    if (u.hostname.endsWith('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return v
      const match = u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{6,})/)
      if (match) return match[1]
    }
    return null
  } catch {
    return null
  }
}

export function getYoutubeThumbnail(url: string): string | null {
  const id = getYoutubeVideoId(url)
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null
}

/**
 * Làm gọn tiêu đề video YouTube (bỏ các cụm "[Karaoke]", "Beat Chuẩn", tên kênh...)
 * để gợi ý tên bài hát sạch sẽ hơn.
 */
export function cleanYoutubeSongTitle(rawTitle: string): string {
  const cleaned = rawTitle
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\([^)]*(?:karaoke|beat|tone|tông|nhạc sống|official|mv|video|lyrics|lời)[^)]*\)/gi, ' ')
    .replace(/\b(?:karaoke|beat chuẩn|beat gốc|nhạc sống|tone nam|tone nữ|tông nam|tông nữ|official mv|lyrics video)\b/gi, ' ')
    .split(/\s+[-|–—]\s+/)[0] ?? rawTitle

  return capitalizeWords(cleaned || rawTitle)
}

/** Lấy tiêu đề video YouTube qua oEmbed (không cần API key). */
export async function fetchYoutubeTitle(url: string): Promise<string | null> {
  if (!getYoutubeVideoId(url)) return null
  try {
    const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url.trim())}&format=json`
    const res = await fetch(endpoint)
    if (!res.ok) return null
    const data = (await res.json()) as { title?: string }
    if (!data.title?.trim()) return null
    return cleanYoutubeSongTitle(data.title)
  } catch {
    return null
  }
}
