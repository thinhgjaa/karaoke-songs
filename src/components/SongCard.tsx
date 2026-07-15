import { useState } from 'react'
import type { Song } from '../lib/types'
import StarRating from './StarRating'

interface SongCardProps {
  song: Song
  onEdit: () => void
  onDelete: () => void
}

export default function SongCard({ song, onEdit, onDelete }: SongCardProps) {
  const [expanded, setExpanded] = useState(false)
  const hasDetails = Boolean(song.lyrics || song.notes)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-white">{song.title}</h3>
          {song.artist && <p className="mt-0.5 truncate text-sm text-slate-400">{song.artist}</p>}
        </div>
        <StarRating value={song.rating} />
      </div>

      {(song.genres.length > 0 || song.moods.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {song.genres.map((g) => (
            <span
              key={g.id}
              className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-xs text-violet-300"
            >
              {g.name}
            </span>
          ))}
          {song.moods.map((m) => (
            <span
              key={m.id}
              className="rounded-full border border-pink-500/30 bg-pink-500/10 px-2.5 py-0.5 text-xs text-pink-300"
            >
              {m.name}
            </span>
          ))}
        </div>
      )}

      {expanded && (
        <div className="mt-3 space-y-3 border-t border-white/5 pt-3">
          {song.notes && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Ghi chú</p>
              <p className="whitespace-pre-wrap text-sm text-slate-300">{song.notes}</p>
            </div>
          )}
          {song.lyrics && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Lời bài hát</p>
              <p className="max-h-64 overflow-y-auto whitespace-pre-wrap text-sm text-slate-300">{song.lyrics}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center gap-1 border-t border-white/5 pt-3 text-sm">
        {song.youtube_url && (
          <a
            href={song.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-2.5 py-1 font-medium text-red-400 transition hover:bg-red-500/10"
          >
            ▶ YouTube
          </a>
        )}
        {hasDetails && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg px-2.5 py-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            {expanded ? 'Thu gọn' : 'Chi tiết'}
          </button>
        )}
        <div className="ml-auto flex gap-1">
          <button
            onClick={onEdit}
            className="rounded-lg px-2.5 py-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            Sửa
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg px-2.5 py-1 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  )
}
