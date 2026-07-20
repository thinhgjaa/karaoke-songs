import { memo, useEffect, useState } from 'react'
import type { Song } from '../lib/types'
import { fetchSongDetails } from '../lib/api'
import { getYoutubeThumbnail } from '../lib/youtube'
import StarRating from './StarRating'

interface SongCardProps {
  song: Song
  index: number
  onEdit: () => void
  onDelete: () => void
}

function SongCard({ song, index, onEdit, onDelete }: SongCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [thumbBroken, setThumbBroken] = useState(false)
  const [details, setDetails] = useState<{ lyrics: string; notes: string } | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)
  const thumbnail = thumbBroken ? null : getYoutubeThumbnail(song.youtube_url)
  const artistNames = song.artists.map((a) => a.name).join(', ')

  useEffect(() => {
    setDetails(null)
    setDetailsError(null)
    setDetailsLoading(false)
  }, [song.id])

  useEffect(() => {
    if (song.lyrics !== undefined || song.notes !== undefined) {
      setDetails({ lyrics: song.lyrics ?? '', notes: song.notes ?? '' })
    }
  }, [song.id, song.lyrics, song.notes])

  useEffect(() => {
    if (!expanded || details !== null) return

    let cancelled = false
    setDetailsLoading(true)
    setDetailsError(null)

    void fetchSongDetails(song.id)
      .then((data) => {
        if (!cancelled) setDetails(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setDetailsError(err instanceof Error ? err.message : 'Không tải được chi tiết.')
        }
      })
      .finally(() => {
        if (!cancelled) setDetailsLoading(false)
      })

    return () => {
      cancelled = true
      setDetailsLoading(false)
    }
  }, [expanded, details, song.id])

  function toggleExpanded() {
    setExpanded((prev) => !prev)
  }

  const hasContent = Boolean(details?.lyrics || details?.notes)

  return (
    <div
      className="group animate-fade-up overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/10 dark:border-white/10 dark:bg-white/5 dark:hover:border-brand-400/40 dark:hover:bg-white/[0.07] dark:hover:shadow-violet-950/40"
      style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
    >
      {thumbnail && (
        <a
          href={song.youtube_url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900"
          title="Mở trên YouTube"
        >
          <img
            src={thumbnail}
            alt={song.title}
            loading="lazy"
            decoding="async"
            onError={() => setThumbBroken(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-slate-900/0 opacity-0 transition group-hover:bg-slate-900/20 group-hover:opacity-100">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/90 pl-1 text-lg text-white shadow-lg">
              ▶
            </span>
          </span>
        </a>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-slate-900 dark:text-white">{song.title}</h3>
            {artistNames && (
              <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{artistNames}</p>
            )}
          </div>
          <StarRating value={song.rating} />
        </div>

        {(song.is_duet || song.genres.length > 0 || song.moods.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
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

        {expanded && (
          <div className="mt-3 space-y-3 border-t border-slate-100 pt-3 dark:border-white/5">
            {detailsLoading && <p className="text-sm text-slate-400">Đang tải chi tiết…</p>}
            {detailsError && <p className="text-sm text-rose-500">{detailsError}</p>}
            {!detailsLoading && !detailsError && details && (
              <>
                {details.notes ? (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Ghi chú</p>
                    <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{details.notes}</p>
                  </div>
                ) : null}
                {details.lyrics ? (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Lời bài hát</p>
                    <p className="max-h-64 overflow-y-auto whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
                      {details.lyrics}
                    </p>
                  </div>
                ) : null}
                {!hasContent && <p className="text-sm text-slate-400">Chưa có lời bài hát hay ghi chú.</p>}
              </>
            )}
            {!detailsLoading && !detailsError && !details && (
              <p className="text-sm text-slate-400">Không tải được chi tiết. Thử bấm Thu gọn rồi mở lại.</p>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-3 text-sm dark:border-white/5">
          {song.youtube_url && !thumbnail && (
            <a
              href={song.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-2.5 py-1 font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              ▶ YouTube
            </a>
          )}
          <button
            onClick={toggleExpanded}
            className="rounded-lg px-2.5 py-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white"
          >
            {expanded ? 'Thu gọn' : 'Chi tiết'}
          </button>
          <div className="ml-auto flex gap-1">
            <button
              onClick={onEdit}
              className="rounded-lg px-2.5 py-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white"
            >
              Sửa
            </button>
            <button
              onClick={onDelete}
              className="rounded-lg px-2.5 py-1 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(SongCard)
