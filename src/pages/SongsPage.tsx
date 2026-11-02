import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { createSong, deleteSong, fetchSongs, updateSong, updateSongRating } from '../lib/api'
import { songFromInput, sortSongs, syncSongTags, type SongSort } from '../lib/songs'
import { matchesSearch } from '../lib/text'
import type { Song, SongInput } from '../lib/types'
import LyricsFullscreen from '../components/LyricsFullscreen'
import RandomSongModal from '../components/RandomSongModal'
import SongCard from '../components/SongCard'
import SongFormModal from '../components/SongFormModal'
import { useConfirm } from '../context/ConfirmContext'
import { useTags } from '../context/TagsContext'
import { useToast } from '../context/ToastContext'
import { useMidnightPing } from '../hooks/useMidnightPing'

type ModalState = { open: false } | { open: true; song: Song | null }

const QUEUE_STORAGE_KEY = 'karaoke_song_queue'

const SORT_OPTIONS: { value: SongSort; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'title-asc', label: 'Tên A → Z' },
  { value: 'title-desc', label: 'Tên Z → A' },
  { value: 'rating-desc', label: 'Sao cao → thấp' },
  { value: 'rating-asc', label: 'Sao thấp → cao' },
]

export default function SongsPage() {
  const { artists, genres, moods, loading: tagsLoading, createTagAndCache, refreshTags } = useTags()
  const toast = useToast()
  const { confirm } = useConfirm()
  const [searchParams, setSearchParams] = useSearchParams()
  const [songs, setSongs] = useState<Song[]>([])
  const [songsLoading, setSongsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>({ open: false })
  const [randomSong, setRandomSong] = useState<Song | null>(null)
  const [lyricsSong, setLyricsSong] = useState<Song | null>(null)
  const [queueExpanded, setQueueExpanded] = useState(true)
  const [queueIds, setQueueIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(QUEUE_STORAGE_KEY)
      const parsed = raw ? (JSON.parse(raw) as unknown) : []
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queueIds))
    } catch {
      /* ignore quota errors */
    }
  }, [queueIds])

  const toggleQueue = useCallback((songId: string) => {
    setQueueIds((prev) => (prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]))
  }, [])

  const queuedSongs = useMemo(
    () =>
      queueIds.flatMap((id) => {
        const found = songs.find((s) => s.id === id)
        return found ? [found] : []
      }),
    [queueIds, songs],
  )

  const search = searchParams.get('q') ?? ''
  const artistFilter = searchParams.get('artist') ?? ''
  const genreFilter = searchParams.get('genre') ?? ''
  const moodFilter = searchParams.get('mood') ?? ''
  const duetFilter = searchParams.get('duet') ?? ''
  const minRating = Number(searchParams.get('rating') ?? '0') || 0
  const rawSort = searchParams.get('sort') ?? 'newest'
  const sort: SongSort = SORT_OPTIONS.some((o) => o.value === rawSort) ? (rawSort as SongSort) : 'newest'

  const loading = songsLoading || tagsLoading

  function setFilter(key: string, value: string | number) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        const str = String(value)
        if (!str || str === '0') next.delete(key)
        else next.set(key, str)
        return next
      },
      { replace: true },
    )
  }

  const hasActiveFilters = Boolean(
    search || artistFilter || genreFilter || moodFilter || duetFilter || minRating > 0,
  )

  function clearFilters() {
    setSearchParams({}, { replace: true })
  }

  const reloadSongs = useCallback(async () => {
    try {
      setSongs(await fetchSongs())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu.')
    } finally {
      setSongsLoading(false)
    }
  }, [])

  useEffect(() => {
    void reloadSongs()
  }, [reloadSongs])

  // Đồng bộ tag trên card: cập nhật tên mới, gỡ tag đã xóa
  useEffect(() => {
    setSongs((prev) => prev.map((song) => syncSongTags(song, artists, genres, moods)))
  }, [artists, genres, moods])

  useMidnightPing(() => {
    void reloadSongs()
  })

  const filtered = useMemo(() => {
    const list = songs.filter((song) => {
      const artistNames = song.artists.map((a) => a.name).join(' ')
      if (!matchesSearch(`${song.title} ${artistNames}`, search)) return false
      if (artistFilter && !song.artists.some((a) => a.id === artistFilter)) return false
      if (genreFilter && !song.genres.some((g) => g.id === genreFilter)) return false
      if (moodFilter && !song.moods.some((m) => m.id === moodFilter)) return false
      if (duetFilter === 'duet' && !song.is_duet) return false
      if (duetFilter === 'solo' && song.is_duet) return false
      if (minRating > 0 && song.rating < minRating) return false
      return true
    })
    return sortSongs(list, sort)
  }, [songs, search, artistFilter, genreFilter, moodFilter, duetFilter, minRating, sort])

  const pickRandom = useCallback(() => {
    if (filtered.length === 0) {
      toast.error('Không có bài nào để chọn ngẫu nhiên.')
      return
    }
    const idx = Math.floor(Math.random() * filtered.length)
    setRandomSong(filtered[idx]!)
  }, [filtered, toast])

  async function handleSave(input: SongInput) {
    if (modal.open && modal.song) {
      await updateSong(modal.song.id, input, modal.song)
      setSongs((prev) =>
        prev.map((s) =>
          s.id === modal.song!.id
            ? songFromInput(s.id, s.created_at, input, artists, genres, moods)
            : s,
        ),
      )
      toast.success(`Đã cập nhật "${input.title.trim()}"`)
    } else {
      const { id, created_at } = await createSong(input)
      setSongs((prev) => [songFromInput(id, created_at, input, artists, genres, moods), ...prev])
      toast.success(`Đã thêm "${input.title.trim()}"`)
    }
    void refreshTags()
  }

  async function handleRate(song: Song, rating: number) {
    const prevRating = song.rating
    setSongs((prev) => prev.map((s) => (s.id === song.id ? { ...s, rating } : s)))
    try {
      await updateSongRating(song.id, rating)
    } catch (err) {
      setSongs((prev) => prev.map((s) => (s.id === song.id ? { ...s, rating: prevRating } : s)))
      toast.error(err instanceof Error ? err.message : 'Không cập nhật được đánh giá.')
    }
  }

  async function handleDelete(song: Song) {
    const ok = await confirm({
      title: 'Xóa bài hát',
      message: `Xóa "${song.title}"? Hành động này không hoàn tác được.`,
      confirmLabel: 'Xóa',
      danger: true,
    })
    if (!ok) return
    try {
      await deleteSong(song.id)
      setSongs((prev) => prev.filter((s) => s.id !== song.id))
      setQueueIds((prev) => prev.filter((id) => id !== song.id))
      toast.success(`Đã xóa "${song.title}"`)
      void refreshTags()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không xóa được bài hát.')
    }
  }

  const selectClass =
    'w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-white/20'

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Bài hát <span className="text-gradient">của tôi</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {songs.length} bài{filtered.length !== songs.length ? ` · đang hiện ${filtered.length}` : ''}
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <button
            type="button"
            onClick={pickRandom}
            disabled={loading || filtered.length === 0}
            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
          >
            🎲 Random
          </button>
          <button
            onClick={() => setModal({ open: true, song: null })}
            className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/30 transition hover:bg-brand-600 sm:w-auto"
          >
            + Thêm bài hát
          </button>
        </div>
      </div>

      {queuedSongs.length > 0 && (
        <section className="mb-5 rounded-xl border border-brand-200 bg-brand-50/50 p-4 dark:border-brand-500/30 dark:bg-brand-500/10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setQueueExpanded((v) => !v)}
              className="flex items-center gap-2 text-sm font-bold text-brand-700 dark:text-brand-200"
            >
              <span>🎤 Danh sách chờ hát hôm nay ({queuedSongs.length} bài)</span>
              <span className="text-xs font-normal text-brand-500">
                {queueExpanded ? '▲ Thu gọn' : '▼ Mở ra'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setQueueIds([])}
              className="text-xs font-medium text-slate-500 transition hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300"
            >
              Xóa danh sách chờ
            </button>
          </div>
          {queueExpanded && (
            <ul className="mt-3 divide-y divide-brand-200/60 dark:divide-white/10">
              {queuedSongs.map((qSong, idx) => (
                <li key={qSong.id} className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <span className="mr-2 inline-block text-xs font-bold text-brand-600 dark:text-brand-400">
                      #{idx + 1}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">{qSong.title}</span>
                    {qSong.artists.length > 0 && (
                      <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                        · {qSong.artists.map((a) => a.name).join(', ')}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLyricsSong(qSong)}
                      className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-brand-700 shadow-sm transition hover:bg-brand-100 dark:bg-white/10 dark:text-brand-200 dark:hover:bg-white/20"
                    >
                      Lời hát
                    </button>
                    {qSong.youtube_url && (
                      <a
                        href={qSong.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-red-500"
                      >
                        ▶ YouTube
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleQueue(qSong.id)}
                      title="Đánh dấu đã hát xong"
                      className="rounded-lg px-2 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                    >
                      ✓ Đã hát
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <div className="relative w-full sm:flex-1">
          <input
            value={search}
            onChange={(e) => setFilter('q', e.target.value)}
            placeholder="Tìm tên bài hát, ca sĩ (không cần dấu)…"
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 pr-9 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-slate-900/60"
          />
          {search && (
            <button
              type="button"
              onClick={() => setFilter('q', '')}
              aria-label="Xóa tìm kiếm"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-100"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <select
            value={artistFilter}
            onChange={(e) => setFilter('artist', e.target.value)}
            className={selectClass}
          >
            <option value="">Mọi ca sĩ</option>
            {artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select
            value={genreFilter}
            onChange={(e) => setFilter('genre', e.target.value)}
            className={selectClass}
          >
            <option value="">Mọi thể loại</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <select
            value={moodFilter}
            onChange={(e) => setFilter('mood', e.target.value)}
            className={selectClass}
          >
            <option value="">Mọi tâm trạng</option>
            {moods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <select
            value={duetFilter}
            onChange={(e) => setFilter('duet', e.target.value)}
            className={selectClass}
          >
            <option value="">Đơn ca &amp; song ca</option>
            <option value="duet">👥 Hát cặp được</option>
            <option value="solo">Chỉ hát đơn</option>
          </select>
          <select
            value={minRating}
            onChange={(e) => setFilter('rating', e.target.value)}
            className={selectClass}
          >
            <option value={0}>Mọi đánh giá</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {'★'.repeat(n)} trở lên
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setFilter('sort', e.target.value)}
            className={selectClass}
            aria-label="Sắp xếp danh sách"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 sm:col-auto dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"
            >
              <div className="skeleton h-36 w-full" />
              <div className="space-y-2.5 p-4">
                <div className="skeleton h-4 w-2/3 rounded-md" />
                <div className="skeleton h-3 w-1/3 rounded-md" />
                <div className="flex gap-1.5 pt-1">
                  <div className="skeleton h-5 w-16 rounded-full" />
                  <div className="skeleton h-5 w-14 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="animate-fade-up rounded-xl border border-dashed border-slate-300 bg-white py-20 text-center dark:border-white/10 dark:bg-white/[0.02]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-3xl dark:bg-brand-500/15">
            🎵
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {songs.length === 0
              ? 'Chưa có bài hát nào. Bấm "Thêm bài hát" để bắt đầu!'
              : 'Không tìm thấy bài nào khớp bộ lọc.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((song, index) => (
            <SongCard
              key={song.id}
              song={song}
              index={index}
              inQueue={queueIds.includes(song.id)}
              onToggleQueue={() => toggleQueue(song.id)}
              onRate={(rating) => void handleRate(song, rating)}
              onFilterArtist={(id) => setFilter('artist', artistFilter === id ? '' : id)}
              onFilterGenre={(id) => setFilter('genre', genreFilter === id ? '' : id)}
              onFilterMood={(id) => setFilter('mood', moodFilter === id ? '' : id)}
              onFilterDuet={() => setFilter('duet', duetFilter === 'duet' ? '' : 'duet')}
              onEdit={() => setModal({ open: true, song })}
              onDelete={() => void handleDelete(song)}
            />
          ))}
        </div>
      )}

      {modal.open && (
        <SongFormModal
          song={modal.song}
          existingSongs={songs}
          artists={artists}
          genres={genres}
          moods={moods}
          onCreateArtist={(name) => createTagAndCache('artists', name)}
          onCreateGenre={(name) => createTagAndCache('genres', name)}
          onCreateMood={(name) => createTagAndCache('moods', name)}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
        />
      )}

      {randomSong && (
        <RandomSongModal
          song={randomSong}
          poolSize={filtered.length}
          inQueue={queueIds.includes(randomSong.id)}
          onToggleQueue={() => toggleQueue(randomSong.id)}
          onReroll={pickRandom}
          onOpenLyrics={() => {
            setLyricsSong(randomSong)
            setRandomSong(null)
          }}
          onClose={() => setRandomSong(null)}
        />
      )}

      {lyricsSong && <LyricsFullscreen song={lyricsSong} onClose={() => setLyricsSong(null)} />}
    </div>
  )
}
