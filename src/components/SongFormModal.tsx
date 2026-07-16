import { useState, type FormEvent } from 'react'
import type { Song, SongInput, Tag } from '../lib/types'
import StarRating from './StarRating'
import TagPicker from './TagPicker'

interface SongFormModalProps {
  song: Song | null
  artists: Tag[]
  genres: Tag[]
  moods: Tag[]
  onCreateArtist: (name: string) => Promise<void>
  onCreateGenre: (name: string) => Promise<void>
  onCreateMood: (name: string) => Promise<void>
  onSave: (input: SongInput) => Promise<void>
  onClose: () => void
}

export default function SongFormModal({
  song,
  artists,
  genres,
  moods,
  onCreateArtist,
  onCreateGenre,
  onCreateMood,
  onSave,
  onClose,
}: SongFormModalProps) {
  const [title, setTitle] = useState(song?.title ?? '')
  const [youtubeUrl, setYoutubeUrl] = useState(song?.youtube_url ?? '')
  const [lyrics, setLyrics] = useState(song?.lyrics ?? '')
  const [notes, setNotes] = useState(song?.notes ?? '')
  const [rating, setRating] = useState(song?.rating ?? 0)
  const [isDuet, setIsDuet] = useState(song?.is_duet ?? false)
  const [artistIds, setArtistIds] = useState<string[]>(song?.artists.map((a) => a.id) ?? [])
  const [genreIds, setGenreIds] = useState<string[]>(song?.genres.map((g) => g.id) ?? [])
  const [moodIds, setMoodIds] = useState<string[]>(song?.moods.map((m) => m.id) ?? [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggle(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError(null)
    try {
      await onSave({
        title,
        youtube_url: youtubeUrl,
        lyrics,
        notes,
        rating,
        is_duet: isDuet,
        artistIds,
        genreIds,
        moodIds,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra, thử lại nhé.')
      setSaving(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30'

  return (
    <div
      className="fixed inset-0 z-50 flex overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="animate-pop-in m-auto w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <h2 className="mb-5 text-lg font-bold">{song ? 'Sửa bài hát' : 'Thêm bài hát mới'}</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Tên bài hát <span className="text-rose-400">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              placeholder="Ví dụ: Nồng nàn Hà Nội"
              className={inputClass}
            />
          </div>

          <TagPicker
            label="Ca sĩ (chọn được nhiều)"
            tags={artists}
            selectedIds={artistIds}
            onToggle={(id) => toggle(artistIds, setArtistIds, id)}
            onCreate={onCreateArtist}
            accent="sky"
          />

          <TagPicker
            label="Thể loại (chọn được nhiều)"
            tags={genres}
            selectedIds={genreIds}
            onToggle={(id) => toggle(genreIds, setGenreIds, id)}
            onCreate={onCreateGenre}
            accent="violet"
          />

          <TagPicker
            label="Tâm trạng (chọn được nhiều)"
            tags={moods}
            selectedIds={moodIds}
            onToggle={(id) => toggle(moodIds, setMoodIds, id)}
            onCreate={onCreateMood}
            accent="pink"
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Link YouTube / beat karaoke</label>
            <input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              type="url"
              placeholder="https://www.youtube.com/watch?v=…"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Lời bài hát</label>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              rows={4}
              placeholder="Dán lời bài hát vào đây…"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Ghi chú riêng (tông giọng, đoạn hay…)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ví dụ: hạ tông -2, vào chậm ở điệp khúc…"
              className={inputClass}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2.5 transition hover:border-cyan-500/40">
            <input
              type="checkbox"
              checked={isDuet}
              onChange={(e) => setIsDuet(e.target.checked)}
              className="h-4 w-4 shrink-0 accent-cyan-500"
            />
            <span className="text-sm font-medium text-slate-300">
              Bài này hát cặp (song ca) được 👥
            </span>
          </label>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-300">Mức độ yêu thích</span>
            <StarRating value={rating} onChange={setRating} size="md" />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:brightness-110 disabled:opacity-50"
          >
            {saving ? 'Đang lưu…' : 'Lưu bài hát'}
          </button>
        </div>
      </form>
    </div>
  )
}
