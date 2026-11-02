import { useEffect, useRef, useState } from 'react'
import { fetchSongDetails, getCachedSongDetails } from '../lib/api'
import type { Song } from '../lib/types'
import ScrollToTopButton from './ScrollToTopButton'
import StarRating from './StarRating'

interface LyricsFullscreenProps {
  song: Song
  initialDetails?: { lyrics: string; notes: string }
  onClose: () => void
}

type FontScale = 'sm' | 'md' | 'lg' | 'xl'
type ScrollSpeed = 0.5 | 1 | 1.5 | 2

const FONT_SCALES: FontScale[] = ['sm', 'md', 'lg', 'xl']
const FONT_CLASSES: Record<FontScale, string> = {
  sm: 'text-base leading-relaxed sm:text-lg sm:leading-relaxed',
  md: 'text-lg leading-relaxed sm:text-xl sm:leading-loose',
  lg: 'text-xl leading-loose sm:text-2xl sm:leading-loose',
  xl: 'text-2xl leading-loose sm:text-3xl sm:leading-loose',
}

const FONT_STORAGE_KEY = 'karaoke_lyrics_font_scale'
const SPEEDS: ScrollSpeed[] = [0.5, 1, 1.5, 2]

export default function LyricsFullscreen({ song, initialDetails, onClose }: LyricsFullscreenProps) {
  const cached = initialDetails ?? getCachedSongDetails(song.id) ?? null
  const [details, setDetails] = useState(cached)
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)
  const [autoScroll, setAutoScroll] = useState(false)
  const [speed, setSpeed] = useState<ScrollSpeed>(1)
  const [fontScale, setFontScale] = useState<FontScale>(() => {
    const saved = localStorage.getItem(FONT_STORAGE_KEY) as FontScale | null
    return saved && FONT_SCALES.includes(saved) ? saved : 'md'
  })
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const artistNames = song.artists.map((a) => a.name).join(', ')

  function changeFontScale(delta: -1 | 1) {
    setFontScale((prev) => {
      const idx = FONT_SCALES.indexOf(prev)
      const next = FONT_SCALES[Math.min(FONT_SCALES.length - 1, Math.max(0, idx + delta))] ?? prev
      localStorage.setItem(FONT_STORAGE_KEY, next)
      return next
    })
  }

  useEffect(() => {
    if (initialDetails) {
      setDetails(initialDetails)
      setLoading(false)
      return
    }
    const fromCache = getCachedSongDetails(song.id)
    if (fromCache) {
      setDetails(fromCache)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    void fetchSongDetails(song.id)
      .then((data) => {
        if (!cancelled) setDetails(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Không tải được lời bài hát.')
        }
      })
      .finally(() => {
        if (!cancelled) setDetails(getCachedSongDetails(song.id) ?? null)
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [song.id, initialDetails])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault()
        setAutoScroll((v) => !v)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // Tự động cuộn lời (Teleprompter)
  useEffect(() => {
    if (!autoScroll) return
    const el = scrollContainerRef.current
    if (!el) return

    let rafId = 0
    let lastTime = performance.now()
    let remainder = 0

    function tick(now: number) {
      const container = scrollContainerRef.current
      if (!container) return
      const dt = (now - lastTime) / 1000
      lastTime = now

      // Tốc độ cơ bản: 28px/giây ở mức 1x
      const delta = 28 * speed * dt + remainder
      const wholePx = Math.trunc(delta)
      remainder = delta - wholePx

      if (wholePx >= 1) {
        container.scrollTop += wholePx
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 2) {
          setAutoScroll(false)
          return
        }
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [autoScroll, speed])

  const hasLyrics = Boolean(details?.lyrics?.trim())

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lyrics-fullscreen-title"
    >
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 sm:px-6 dark:border-white/10">
          <div className="min-w-0 flex-1">
            <h2
              id="lyrics-fullscreen-title"
              className="truncate text-lg font-bold text-slate-900 sm:text-xl dark:text-white"
            >
              {song.title}
            </h2>
            {artistNames && (
              <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{artistNames}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasLyrics && (
              <>
                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-white/10 dark:bg-white/5">
                  <button
                    type="button"
                    onClick={() => changeFontScale(-1)}
                    disabled={fontScale === 'sm'}
                    title="Giảm cỡ chữ"
                    className="rounded-md px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-white disabled:opacity-40 dark:text-slate-300 dark:hover:bg-white/10"
                  >
                    A-
                  </button>
                  <button
                    type="button"
                    onClick={() => changeFontScale(1)}
                    disabled={fontScale === 'xl'}
                    title="Tăng cỡ chữ"
                    className="rounded-md px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-white disabled:opacity-40 dark:text-slate-300 dark:hover:bg-white/10"
                  >
                    A+
                  </button>
                </div>

                <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-white/10 dark:bg-white/5">
                  <button
                    type="button"
                    onClick={() => setAutoScroll((v) => !v)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${autoScroll
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-white dark:text-slate-200 dark:hover:bg-white/10'
                      }`}
                  >
                    {autoScroll ? '⏸ Dừng cuộn' : '▶ Tự cuộn'}
                  </button>
                  <select
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value) as ScrollSpeed)}
                    aria-label="Tốc độ cuộn"
                    className="rounded-md bg-transparent px-1.5 py-1 text-xs font-medium text-slate-600 outline-none dark:text-slate-300"
                  >
                    {SPEEDS.map((s) => (
                      <option key={s} value={s} className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                        {s}x
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="hidden sm:block">
              <StarRating value={song.rating} size="md" />
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              Đóng
            </button>
          </div>
        </header>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
          {loading && <p className="text-center text-slate-500 dark:text-slate-400">Đang tải lời bài hát…</p>}
          {error && <p className="text-center text-rose-600 dark:text-rose-400">{error}</p>}
          {!loading && !error && details?.notes?.trim() && (
            <div className="mx-auto mb-6 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400/80">
                Ghi chú
              </p>
              <p className="whitespace-pre-wrap text-sm text-amber-900 dark:text-amber-100/90">{details.notes}</p>
            </div>
          )}
          {!loading && !error && hasLyrics && (
              <p
                className={`mx-auto max-w-3xl whitespace-pre-wrap text-center text-slate-700 transition-all dark:text-slate-200 ${FONT_CLASSES[fontScale]}`}
              >
                {details!.lyrics}
              </p>
        )}
              {!loading && !error && !hasLyrics && (
                <p className="text-center text-slate-500 dark:text-slate-400">Bài này chưa có lời bài hát.</p>
              )}
              <ScrollToTopButton containerRef={scrollContainerRef} />
            </div>

      {song.youtube_url && (
            <footer className="shrink-0 border-t border-slate-200 px-4 py-3 text-center sm:px-6 dark:border-white/10">
              <a
                href={song.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                ▶ Mở YouTube
              </a>
            </footer>
          )}
        </div>
        )
}
