import { supabase } from './supabase'
import { capitalizeWords } from './text'
import type { Song, SongInput, Tag } from './types'

export type TagTable = 'artists' | 'genres' | 'moods'

interface SongRow {
  id: string
  title: string
  youtube_url: string
  lyrics?: string
  notes?: string
  rating: number
  is_duet: boolean
  created_at: string
  artists: Tag[]
  genres: Tag[]
  moods: Tag[]
}

const songListSelect =
  'id, title, youtube_url, rating, is_duet, created_at, artists(id, name), genres(id, name), moods(id, name)'

/** Bộ nhớ đệm chi tiết bài hát (lyrics & notes) để không phải tải lại nhiều lần */
const songDetailsCache = new Map<string, { lyrics: string; notes: string }>()

export function getCachedSongDetails(id: string): { lyrics: string; notes: string } | undefined {
  return songDetailsCache.get(id)
}

export function setCachedSongDetails(id: string, details: { lyrics: string; notes: string }): void {
  songDetailsCache.set(id, details)
}

export async function fetchSongs(): Promise<Song[]> {
  const { data, error } = await supabase
    .from('songs')
    .select(songListSelect)
    .order('created_at', { ascending: false })
  if (error) throw error
  const rows = (data as SongRow[]) ?? []
  return rows.map((row) => {
    const cached = songDetailsCache.get(row.id)
    return cached ? { ...row, lyrics: cached.lyrics, notes: cached.notes } : row
  })
}

export async function fetchSongDetails(id: string): Promise<{ lyrics: string; notes: string }> {
  const cached = songDetailsCache.get(id)
  if (cached) return cached

  const { data, error } = await supabase.from('songs').select('lyrics, notes').eq('id', id).single()
  if (error) throw error
  const details = { lyrics: data.lyrics ?? '', notes: data.notes ?? '' }
  songDetailsCache.set(id, details)
  return details
}

const junctionByTable: Record<TagTable, 'song_artists' | 'song_genres' | 'song_moods'> = {
  artists: 'song_artists',
  genres: 'song_genres',
  moods: 'song_moods',
}

export async function fetchTags(table: TagTable): Promise<Tag[]> {
  const junction = junctionByTable[table]
  const { data, error } = await supabase
    .from(table)
    .select(`id, name, created_at, ${junction}(count)`)
  if (error) {
    // Fallback nếu truy vấn count lỗi
    const fallback = await supabase.from(table).select('id, name, created_at')
    if (fallback.error) throw fallback.error
    return fallback.data ?? []
  }

  return (data ?? []).map((row: Record<string, unknown>) => {
    const relation = row[junction] as Array<{ count?: number }> | undefined
    const count = Array.isArray(relation) && typeof relation[0]?.count === 'number' ? relation[0].count : 0
    return {
      id: String(row.id),
      name: String(row.name),
      created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
      song_count: count,
    }
  })
}

export async function createTag(table: TagTable, name: string): Promise<Tag> {
  const { data, error } = await supabase
    .from(table)
    .insert({ name: capitalizeWords(name) })
    .select('id, name, created_at')
    .single()
  if (error) throw error
  return { ...data, song_count: 0 }
}

export async function renameTag(table: TagTable, id: string, name: string): Promise<void> {
  const { error } = await supabase.from(table).update({ name: capitalizeWords(name) }).eq('id', id)
  if (error) throw error
}

export async function deleteTag(table: TagTable, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

  function sameIds(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false
    const sortedA = [...a].sort()
    const sortedB = [...b].sort()
    return sortedA.every((val, idx) => val === sortedB[idx])
  }

    async function setSongTags(songId: string, input: SongInput, previousSong?: Song): Promise<void> {
      const artistsChanged = !previousSong || !sameIds(previousSong.artists.map((a) => a.id), input.artistIds)
      const genresChanged = !previousSong || !sameIds(previousSong.genres.map((g) => g.id), input.genreIds)
      const moodsChanged = !previousSong || !sameIds(previousSong.moods.map((m) => m.id), input.moodIds)

      const deleteTasks = []
      if (artistsChanged) deleteTasks.push(supabase.from('song_artists').delete().eq('song_id', songId))
      if (genresChanged) deleteTasks.push(supabase.from('song_genres').delete().eq('song_id', songId))
      if (moodsChanged) deleteTasks.push(supabase.from('song_moods').delete().eq('song_id', songId))

      if (deleteTasks.length > 0) {
        const deleteResults = await Promise.all(deleteTasks)
        for (const res of deleteResults) {
          if (res.error) throw res.error
        }
      }

        const insertTasks = []
        if (artistsChanged && input.artistIds.length > 0) {
          insertTasks.push(
            supabase.from('song_artists').insert(input.artistIds.map((artist_id) => ({ song_id: songId, artist_id }))),
          )
        }
          if (genresChanged && input.genreIds.length > 0) {
            insertTasks.push(
              supabase.from('song_genres').insert(input.genreIds.map((genre_id) => ({ song_id: songId, genre_id }))),
            )
          }
          if (moodsChanged && input.moodIds.length > 0) {
            insertTasks.push(
              supabase.from('song_moods').insert(input.moodIds.map((mood_id) => ({ song_id: songId, mood_id }))),
            )
          }

          if (insertTasks.length > 0) {
            const insertResults = await Promise.all(insertTasks)
            for (const res of insertResults) {
              if (res.error) throw res.error
            }
          }
        }

        function songFields(input: SongInput) {
          return {
            title: capitalizeWords(input.title),
            youtube_url: input.youtube_url.trim(),
            lyrics: input.lyrics,
            notes: input.notes,
            rating: input.rating,
            is_duet: input.is_duet,
          }
        }

        export async function createSong(input: SongInput): Promise<{ id: string; created_at: string }> {
          const { data, error } = await supabase.from('songs').insert(songFields(input)).select('id, created_at').single()
          if (error) throw error
          await setSongTags(data.id, input)
          songDetailsCache.set(data.id, { lyrics: input.lyrics, notes: input.notes })
          return data
        }

          export async function updateSong(id: string, input: SongInput, previousSong?: Song): Promise<void> {
            const { error } = await supabase.from('songs').update(songFields(input)).eq('id', id)
            if (error) throw error
            await setSongTags(id, input, previousSong)
            songDetailsCache.set(id, { lyrics: input.lyrics, notes: input.notes })
          }

          export async function updateSongRating(id: string, rating: number): Promise<void> {
            const { error } = await supabase.from('songs').update({ rating }).eq('id', id)
            if (error) throw error
          }

          export async function deleteSong(id: string): Promise<void> {
            const { error } = await supabase.from('songs').delete().eq('id', id)
            if (error) throw error
            songDetailsCache.delete(id)
          }
