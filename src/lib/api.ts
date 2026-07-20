import { supabase } from './supabase'
import type { Song, SongInput, Tag } from './types'

export type TagTable = 'artists' | 'genres' | 'moods'

interface SongRow {
  id: string
  title: string
  youtube_url: string
  lyrics: string
  notes: string
  rating: number
  is_duet: boolean
  created_at: string
  artists: Tag[]
  genres: Tag[]
  moods: Tag[]
}

export async function fetchSongs(): Promise<Song[]> {
  const { data, error } = await supabase
    .from('songs')
    .select(
      'id, title, youtube_url, lyrics, notes, rating, is_duet, created_at, artists(id, name), genres(id, name), moods(id, name)',
    )
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as SongRow[]) ?? []
}

export async function fetchTags(table: TagTable): Promise<Tag[]> {
  const { data, error } = await supabase.from(table).select('id, name, created_at')
  if (error) throw error
  return data ?? []
}

export async function createTag(table: TagTable, name: string): Promise<Tag> {
  const { data, error } = await supabase
    .from(table)
    .insert({ name: name.trim() })
    .select('id, name, created_at')
    .single()
  if (error) throw error
  return data
}

export async function renameTag(table: TagTable, id: string, name: string): Promise<void> {
  const { error } = await supabase.from(table).update({ name: name.trim() }).eq('id', id)
  if (error) throw error
}

export async function deleteTag(table: TagTable, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

async function setSongTags(songId: string, input: SongInput): Promise<void> {
  const [da, dg, dm] = await Promise.all([
    supabase.from('song_artists').delete().eq('song_id', songId),
    supabase.from('song_genres').delete().eq('song_id', songId),
    supabase.from('song_moods').delete().eq('song_id', songId),
  ])
  if (da.error) throw da.error
  if (dg.error) throw dg.error
  if (dm.error) throw dm.error

  if (input.artistIds.length > 0) {
    const { error } = await supabase
      .from('song_artists')
      .insert(input.artistIds.map((artist_id) => ({ song_id: songId, artist_id })))
    if (error) throw error
  }
  if (input.genreIds.length > 0) {
    const { error } = await supabase
      .from('song_genres')
      .insert(input.genreIds.map((genre_id) => ({ song_id: songId, genre_id })))
    if (error) throw error
  }
  if (input.moodIds.length > 0) {
    const { error } = await supabase
      .from('song_moods')
      .insert(input.moodIds.map((mood_id) => ({ song_id: songId, mood_id })))
    if (error) throw error
  }
}

function songFields(input: SongInput) {
  return {
    title: input.title.trim(),
    youtube_url: input.youtube_url.trim(),
    lyrics: input.lyrics,
    notes: input.notes,
    rating: input.rating,
    is_duet: input.is_duet,
  }
}

export async function createSong(input: SongInput): Promise<void> {
  const { data, error } = await supabase.from('songs').insert(songFields(input)).select('id').single()
  if (error) throw error
  await setSongTags(data.id, input)
}

export async function updateSong(id: string, input: SongInput): Promise<void> {
  const { error } = await supabase.from('songs').update(songFields(input)).eq('id', id)
  if (error) throw error
  await setSongTags(id, input)
}

export async function deleteSong(id: string): Promise<void> {
  const { error } = await supabase.from('songs').delete().eq('id', id)
  if (error) throw error
}
