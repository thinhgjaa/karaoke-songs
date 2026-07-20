import { useEffect, useState } from 'react'
import { fetchSongDetails } from '../lib/api'
import type { Song } from '../lib/types'
import StarRating from './StarRating'

interface LyricsFullscreenProps {
  song: Song
  initialDetails?: { lyrics: string; notes: string }
  onClose: () => void
}

export default function LyricsFullscreen({ song, initialDetails, onClose }: LyricsFullscreenProps) {
  const [details, setDetails] = useState(initialDetails ?? null)
  const [loading, setLoading] = useState(!initialDetails)
  const [error, setError] = useState<string | null>(null)
  const artistNames = song.artists.map((a) => a.name).join(', ')

  useEffect(() => {
    if (initialDetails) {
      setDetails(initialDetails)
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
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [song.id, initialDetails])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
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

  const hasLyrics = Boolean(details?.lyrics?.trim())

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-slate-950 text-slate-100"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lyrics-fullscreen-title"
    >
      <header className="flex shrink-0 items-start gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <h2 id="lyrics-fullscreen-title" className="truncate text-lg font-bold sm:text-xl">
            {song.title}
          </h2>
          {artistNames && (
            <p className="mt-0.5 truncate text-sm text-slate-400">{artistNames}</p>
          )}
        </div>
        <StarRating value={song.rating} size="md" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Đóng
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
        {loading && <p className="text-center text-slate-400">Đang tải lời bài hát…</p>}
        {error && <p className="text-center text-rose-400">{error}</p>}
        {!loading && !error && details?.notes?.trim() && (
          <div className="mx-auto mb-6 max-w-3xl rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-400/80">
              Ghi chú
            </p>
            <p className="whitespace-pre-wrap text-sm text-amber-100/90">{details.notes}</p>
          </div>
        )}
        {!loading && !error && hasLyrics && (
          <p className="mx-auto max-w-3xl whitespace-pre-wrap text-center text-lg leading-relaxed sm:text-xl sm:leading-loose">
            {details!.lyrics}
          </p>
        )}
        {!loading && !error && !hasLyrics && (
          <p className="text-center text-slate-500">Bài này chưa có lời bài hát.</p>
        )}
      </div>

      {song.youtube_url && (
        <footer className="shrink-0 border-t border-white/10 px-4 py-3 text-center sm:px-6">
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
