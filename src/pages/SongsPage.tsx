import { useCallback, useEffect, useMemo, useState } from 'react'
import { createSong, createTag, deleteSong, fetchSongs, fetchTags, updateSong } from '../lib/api'
import { matchesSearch } from '../lib/text'
import type { Song, SongInput, Tag } from '../lib/types'
import SongCard from '../components/SongCard'
import SongFormModal from '../components/SongFormModal'

type ModalState = { open: false } | { open: true; song: Song | null }

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [genres, setGenres] = useState<Tag[]>([])
  const [moods, setMoods] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState('')
  const [moodFilter, setMoodFilter] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [modal, setModal] = useState<ModalState>({ open: false })

  const reload = useCallback(async () => {
    try {
      const [songData, genreData, moodData] = await Promise.all([
        fetchSongs(),
        fetchTags('genres'),
        fetchTags('moods'),
      ])
      setSongs(songData)
      setGenres(genreData)
      setMoods(moodData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const filtered = useMemo(
    () =>
      songs.filter((song) => {
        if (!matchesSearch(`${song.title} ${song.artist}`, search)) return false
        if (genreFilter && !song.genres.some((g) => g.id === genreFilter)) return false
        if (moodFilter && !song.moods.some((m) => m.id === moodFilter)) return false
        if (minRating > 0 && song.rating < minRating) return false
        return true
      }),
    [songs, search, genreFilter, moodFilter, minRating],
  )

  async function handleSave(input: SongInput) {
    if (modal.open && modal.song) {
      await updateSong(modal.song.id, input)
    } else {
      await createSong(input)
    }
    await reload()
  }

  async function handleDelete(song: Song) {
    if (!window.confirm(`Xóa bài "${song.title}"? Hành động này không hoàn tác được.`)) return
    try {
      await deleteSong(song.id)
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không xóa được bài hát.')
    }
  }

  async function handleCreateGenre(name: string) {
    await createTag('genres', name)
    setGenres(await fetchTags('genres'))
  }

  async function handleCreateMood(name: string) {
    await createTag('moods', name)
    setMoods(await fetchTags('moods'))
  }

  const selectClass =
    'rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm outline-none transition focus:border-violet-500'

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Bài hát của tôi</h1>
          <p className="text-sm text-slate-400">
            {songs.length} bài{filtered.length !== songs.length ? ` · đang hiện ${filtered.length}` : ''}
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true, song: null })}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:brightness-110"
        >
          + Thêm bài hát
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm tên bài hát, ca sĩ (không cần dấu)…"
          className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 sm:flex-1"
        />
        <div className="flex flex-wrap gap-2">
          <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)} className={selectClass}>
            <option value="">Mọi thể loại</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <select value={moodFilter} onChange={(e) => setMoodFilter(e.target.value)} className={selectClass}>
            <option value="">Mọi tâm trạng</option>
            {moods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className={selectClass}
          >
            <option value={0}>Mọi đánh giá</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {'★'.repeat(n)} trở lên
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <p className="py-16 text-center text-sm text-slate-400">Đang tải…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
          <p className="text-3xl">🎵</p>
          <p className="mt-2 text-sm text-slate-400">
            {songs.length === 0 ? 'Chưa có bài hát nào. Bấm "Thêm bài hát" để bắt đầu!' : 'Không tìm thấy bài nào khớp bộ lọc.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onEdit={() => setModal({ open: true, song })}
              onDelete={() => void handleDelete(song)}
            />
          ))}
        </div>
      )}

      {modal.open && (
        <SongFormModal
          song={modal.song}
          genres={genres}
          moods={moods}
          onCreateGenre={handleCreateGenre}
          onCreateMood={handleCreateMood}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  )
}
