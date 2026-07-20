export interface Tag {
  id: string
  name: string
  created_at?: string
}

export interface Song {
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

export interface SongInput {
  title: string
  youtube_url: string
  lyrics: string
  notes: string
  rating: number
  is_duet: boolean
  artistIds: string[]
  genreIds: string[]
  moodIds: string[]
}
