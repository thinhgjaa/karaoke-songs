export interface Tag {
  id: string
  name: string
}

export interface Song {
  id: string
  title: string
  artist: string
  youtube_url: string
  lyrics: string
  notes: string
  rating: number
  is_duet: boolean
  created_at: string
  genres: Tag[]
  moods: Tag[]
}

export interface SongInput {
  title: string
  artist: string
  youtube_url: string
  lyrics: string
  notes: string
  rating: number
  is_duet: boolean
  genreIds: string[]
  moodIds: string[]
}
