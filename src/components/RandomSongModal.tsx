import { useEffect, useState } from 'react'
import type { Song } from '../lib/types'
import { getYoutubeThumbnail } from '../lib/youtube'
import StarRating from './StarRating'

interface RandomSongModalProps {
  song: Song
  poolSize: number
  onReroll: () => void
  onOpenLyrics: () => void
  onClose: () => void
}

export default function RandomSongModal({
  song,
  poolSize,
  onReroll,
  onOpenLyrics,
  onClose,
}: RandomSongModalProps) {
  const artistNames = song.artists.map((a) => a.name).join(', ')
  const [thumbBroken, setThumbBroken] = useState(false)
  const thumbnail = thumbBroken ? null : getYoutubeThumbnail(song.youtube_url)

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

  useEffect(() => {
    setThumbBroken(false)
  }, [song.youtube_url])

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm dark:bg-black/60">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="random-song-title"
        className="animate-pop-in w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
      >
        {thumbnail && (
          <div className="aspect-video overflow-hidden bg-slate-100 dark:bg-slate-950">
            <img
              src={thumbnail}
              alt={song.title}
              loading="lazy"
              decoding="async"
              onError={() => setThumbBroken(true)}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="p-6">
        <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
          🎲 Bài được chọn
        </p>
        <h2 id="random-song-title" className="text-center text-xl font-bold text-slate-900 dark:text-white">
          {song.title}
        </h2>
        {artistNames && (
          <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">{artistNames}</p>
        )}
        <div className="mt-3 flex justify-center">
          <StarRating value={song.rating} size="md" />
        </div>

        {(song.is_duet || song.genres.length > 0 || song.moods.length > 0) && (
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {song.is_duet && (
              <span className="rounded-md bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                👥 Song ca
              </span>
            )}
            {song.genres.map((g) => (
              <span
                key={g.id}
                className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
              >
                {g.name}
              </span>
            ))}
            {song.moods.map((m) => (
              <span
                key={m.id}
                className="rounded-md bg-pink-50 px-2 py-0.5 text-xs font-medium text-pink-700 dark:bg-pink-500/10 dark:text-pink-300"
              >
                {m.name}
              </span>
            ))}
          </div>
        )}

        <p className="mt-4 text-center text-xs text-slate-400">
          Chọn ngẫu nhiên trong {poolSize} bài đang hiển thị
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
          <button
            type="button"
            onClick={onOpenLyrics}
            className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Xem lời full màn hình
          </button>
          {song.youtube_url && (
            <a
              href={song.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
            >
              ▶ YouTube
            </a>
          )}
          <button
            type="button"
            onClick={onReroll}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
          >
            Chọn lại
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2.5 text-sm text-slate-500 transition hover:bg-slate-100 dark:hover:bg-white/5"
          >
            Đóng
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}
