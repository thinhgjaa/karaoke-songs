import { useEffect, useRef } from 'react'

/**
 * Gọi `onPing` đúng lúc 0:00 theo giờ máy (và mỗi đêm tiếp theo nếu tab vẫn mở).
 * Dùng để reload dữ liệu từ Supabase khi qua ngày mới.
 */
export function useMidnightPing(onPing: () => void, enabled = true) {
  const onPingRef = useRef(onPing)
  onPingRef.current = onPing

  useEffect(() => {
    if (!enabled) return

    let timeoutId: ReturnType<typeof setTimeout>

    function msUntilNextMidnight() {
      const now = new Date()
      const next = new Date(now)
      next.setHours(24, 0, 0, 0)
      return next.getTime() - now.getTime()
    }

    function schedule() {
      timeoutId = setTimeout(() => {
        onPingRef.current()
        schedule()
      }, msUntilNextMidnight())
    }

    schedule()
    return () => clearTimeout(timeoutId)
  }, [enabled])
}
