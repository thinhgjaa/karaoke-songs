import { useEffect, useState, type FormEvent } from 'react'
import { fetchSongDetails } from '../lib/api'
import type { Song, SongInput, Tag } from '../lib/types'
import StarRating from './StarRating'
import TagPicker from './TagPicker'

interface SongFormModalProps {
  song: Song | null
  artists: Tag[]
  genres: Tag[]
  moods: Tag[]
  onCreateArtist: (name: string) => Promise<Tag>
  onCreateGenre: (name: string) => Promise<Tag>
  onCreateMood: (name: string) => Promise<Tag>
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
  const [detailsLoading, setDetailsLoading] = useState(false)

  useEffect(() => {
    if (!song?.id || (song.lyrics !== undefined && song.notes !== undefined)) return

    let cancelled = false
    setDetailsLoading(true)

    void fetchSongDetails(song.id)
      .then((data) => {
        if (!cancelled) {
          setLyrics(data.lyrics ?? '')
          setNotes(data.notes ?? '')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Không tải được chi tiết bài hát.')
        }
      })
      .finally(() => {
        if (!cancelled) setDetailsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [song?.id, song?.lyrics, song?.notes])

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
    'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-slate-900/60'

  return (
    <div
      className="fixed inset-0 z-50 flex overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm dark:bg-black/60"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="animate-pop-in m-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900"
      >
        <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">
          {song ? 'Sửa bài hát' : 'Thêm bài hát mới'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Tên bài hát <span className="text-rose-500">*</span>
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
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Link YouTube / beat karaoke</label>
            <input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              type="url"
              placeholder="https://www.youtube.com/watch?v=…"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Lời bài hát</label>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              rows={4}
              placeholder={detailsLoading ? 'Đang tải lời bài hát…' : 'Dán lời bài hát vào đây…'}
              disabled={detailsLoading}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Ghi chú riêng (tông giọng, đoạn hay…)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={detailsLoading ? 'Đang tải ghi chú…' : 'Ví dụ: hạ tông -2, vào chậm ở điệp khúc…'}
              disabled={detailsLoading}
              className={inputClass}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm transition hover:border-cyan-400 dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-cyan-500/40">
            <input
              type="checkbox"
              checked={isDuet}
              onChange={(e) => setIsDuet(e.target.checked)}
              className="h-4 w-4 shrink-0 accent-cyan-600"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Bài này hát cặp (song ca) được 👥
            </span>
          </label>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Mức độ yêu thích
            </span>
            <StarRating value={rating} onChange={setRating} size="md" />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving || !title.trim() || detailsLoading}
            className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/30 transition hover:bg-brand-600 disabled:opacity-50"
          >
            {saving ? 'Đang lưu…' : 'Lưu bài hát'}
          </button>
        </div>
      </form>
    </div>
  )
}
