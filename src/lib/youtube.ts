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
