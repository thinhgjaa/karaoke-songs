import { useState } from 'react'
import type { Song } from '../lib/types'
import { getYoutubeThumbnail } from '../lib/youtube'
import StarRating from './StarRating'

interface SongCardProps {
  song: Song
  index: number
  onEdit: () => void
  onDelete: () => void
}

export default function SongCard({ song, index, onEdit, onDelete }: SongCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [thumbBroken, setThumbBroken] = useState(false)
  const hasDetails = Boolean(song.lyrics || song.notes)
  const thumbnail = thumbBroken ? null : getYoutubeThumbnail(song.youtube_url)
  const artistNames = song.artists.map((a) => a.name).join(', ')

  return (
    <div
      className="group animate-fade-up overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/10"
      style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
    >
      {thumbnail && (
        <a
          href={song.youtube_url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block aspect-video overflow-hidden bg-slate-100"
          title="Mở trên YouTube"
        >
          <img
            src={thumbnail}
            alt={song.title}
            loading="lazy"
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
            <h3 className="truncate font-semibold text-slate-900">{song.title}</h3>
            {artistNames && <p className="mt-0.5 truncate text-sm text-slate-500">{artistNames}</p>}
          </div>
          <StarRating value={song.rating} />
        </div>

        {(song.is_duet || song.genres.length > 0 || song.moods.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {song.is_duet && (
              <span className="rounded-md bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-700">
                👥 Song ca
              </span>
            )}
            {song.genres.map((g) => (
              <span
                key={g.id}
                className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700"
              >
                {g.name}
              </span>
            ))}
            {song.moods.map((m) => (
              <span
                key={m.id}
                className="rounded-md bg-pink-50 px-2 py-0.5 text-xs font-medium text-pink-700"
              >
                {m.name}
              </span>
            ))}
          </div>
        )}

        {expanded && (
          <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
            {song.notes && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Ghi chú</p>
                <p className="whitespace-pre-wrap text-sm text-slate-600">{song.notes}</p>
              </div>
            )}
            {song.lyrics && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Lời bài hát</p>
                <p className="max-h-64 overflow-y-auto whitespace-pre-wrap text-sm text-slate-600">{song.lyrics}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-3 text-sm">
          {song.youtube_url && !thumbnail && (
            <a
              href={song.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-2.5 py-1 font-medium text-red-600 transition hover:bg-red-50"
            >
              ▶ YouTube
            </a>
          )}
          {hasDetails && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="rounded-lg px-2.5 py-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {expanded ? 'Thu gọn' : 'Chi tiết'}
            </button>
          )}
          <div className="ml-auto flex gap-1">
            <button
              onClick={onEdit}
              className="rounded-lg px-2.5 py-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Sửa
            </button>
            <button
              onClick={onDelete}
              className="rounded-lg px-2.5 py-1 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
