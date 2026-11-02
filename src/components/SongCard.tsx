import { memo, useEffect, useState } from 'react'
import type { Song } from '../lib/types'
import { fetchSongDetails, getCachedSongDetails } from '../lib/api'
import { getYoutubeThumbnail } from '../lib/youtube'
import LyricsFullscreen from './LyricsFullscreen'
import StarRating from './StarRating'

interface SongCardProps {
  song: Song
  index: number
  inQueue?: boolean
  onToggleQueue?: () => void
  onRate?: (rating: number) => void
  onFilterArtist?: (artistId: string) => void
  onFilterGenre?: (genreId: string) => void
  onFilterMood?: (moodId: string) => void
  onFilterDuet?: () => void
  onEdit: () => void
  onDelete: () => void
}

  function SongCard({
    song,
    index,
    inQueue = false,
    onToggleQueue,
    onRate,
    onFilterArtist,
    onFilterGenre,
    onFilterMood,
    onFilterDuet,
    onEdit,
    onDelete,
  }: SongCardProps) {
    const [expanded, setExpanded] = useState(false)
    const [thumbBroken, setThumbBroken] = useState(false)
    const [details, setDetails] = useState<{ lyrics: string; notes: string } | null>(
      () => getCachedSongDetails(song.id) ?? null,
    )
    const [detailsLoading, setDetailsLoading] = useState(false)
    const [detailsError, setDetailsError] = useState<string | null>(null)
    const [lyricsOpen, setLyricsOpen] = useState(false)
    const thumbnail = thumbBroken ? null : getYoutubeThumbnail(song.youtube_url)

    useEffect(() => {
      setDetails(getCachedSongDetails(song.id) ?? null)
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

      const cached = getCachedSongDetails(song.id)
      if (cached) {
        setDetails(cached)
        return
      }

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

    function openLyrics() {
      if (!details && !detailsLoading) {
        setExpanded(true)
      }
      setLyricsOpen(true)
    }

    const hasContent = Boolean(details?.lyrics || details?.notes)

    return (
    <>
      {lyricsOpen && (
            <LyricsFullscreen
              song={song}
              initialDetails={details ?? undefined}
              onClose={() => setLyricsOpen(false)}
            />
          )}
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
                              {song.artists.length > 0 && (
                                <div className="mt-0.5 flex flex-wrap gap-x-1.5 gap-y-0.5 text-sm text-slate-500 dark:text-slate-400">
                                  {song.artists.map((artist, i) => (
                                    <span key={artist.id}>
                                      <button
                                        type="button"
                                        onClick={() => onFilterArtist?.(artist.id)}
                                        title={`Lọc bài hát của ${artist.name}`}
                                        className="transition hover:text-sky-600 hover:underline dark:hover:text-sky-400"
                                      >
                                        {artist.name}
                                      </button>
                                      {i < song.artists.length - 1 ? ',' : ''}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <StarRating value={song.rating} onChange={onRate} />
                          </div>

          {(song.is_duet || song.genres.length > 0 || song.moods.length > 0) && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {song.is_duet && (
                                  <button
                                    type="button"
                                    onClick={onFilterDuet}
                                    title="Lọc bài hát cặp (song ca)"
                                    className="rounded-md bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-700 transition hover:bg-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20"
                                  >
                                    👥 Song ca
                                  </button>
                                )}
                                {song.genres.map((g) => (
                                  <button
                                    key={g.id}
                                    type="button"
                                    onClick={() => onFilterGenre?.(g.id)}
                                    title={`Lọc thể loại: ${g.name}`}
                                    className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 transition hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-300 dark:hover:bg-brand-500/25"
                                  >
                                    {g.name}
                                  </button>
                                ))}
                                {song.moods.map((m) => (
                                  <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => onFilterMood?.(m.id)}
                                    title={`Lọc tâm trạng: ${m.name}`}
                                    className="rounded-md bg-pink-50 px-2 py-0.5 text-xs font-medium text-pink-700 transition hover:bg-pink-100 dark:bg-pink-500/10 dark:text-pink-300 dark:hover:bg-pink-500/20"
                                  >
                                    {m.name}
                                  </button>
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
                                          <button
                                            type="button"
                                            onClick={openLyrics}
                                            className="mt-2 text-xs font-medium text-brand-600 transition hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                                          >
                                            Mở full màn hình →
                                          </button>
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

                              <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-slate-100 pt-3 text-sm dark:border-white/5">
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
                                <button
                                  type="button"
                                  onClick={openLyrics}
                                  className="rounded-lg px-2.5 py-1 text-slate-500 transition hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
                                  title="Xem lời bài hát full màn hình"
                                >
                                  Lời hát
                                </button>
                                {onToggleQueue && (
                                  <button
                                    type="button"
                                    onClick={onToggleQueue}
                                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${inQueue
                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300'
                                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white'
                                      }`}
                                    title={inQueue ? 'Bỏ khỏi danh sách chờ hát' : 'Thêm vào danh sách chờ hát hôm nay'}
                                  >
                                    {inQueue ? '✓ Chờ hát' : '+ Chờ hát'}
                                  </button>
                                )}
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
                      </>
                    )
                    }

                    export default memo(SongCard)
