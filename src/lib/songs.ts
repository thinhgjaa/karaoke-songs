import type { Song, SongInput, Tag } from './types'

function pickTags(tags: Tag[], ids: string[]): Tag[] {
  return tags.filter((t) => ids.includes(t.id))
}

/** Dựng object bài hát cho list từ input + cache tag (không gồm lyrics/notes). */
export function songFromInput(
  id: string,
  created_at: string,
  input: SongInput,
  artists: Tag[],
  genres: Tag[],
  moods: Tag[],
): Song {
  return {
    id,
    created_at,
    title: input.title.trim(),
    youtube_url: input.youtube_url.trim(),
    lyrics: input.lyrics,
    notes: input.notes,
    rating: input.rating,
    is_duet: input.is_duet,
    artists: pickTags(artists, input.artistIds),
    genres: pickTags(genres, input.genreIds),
    moods: pickTags(moods, input.moodIds),
  }
}

/** Đồng bộ tag trên bài hát với cache — gỡ tag đã xóa, cập nhật tên mới. */
export function syncSongTags(song: Song, artists: Tag[], genres: Tag[], moods: Tag[]): Song {
  const mapTags = (current: Tag[], pool: Tag[]) =>
    current.flatMap((t) => {
      const fresh = pool.find((x) => x.id === t.id)
      return fresh ? [fresh] : []
    })

  return {
    ...song,
    artists: mapTags(song.artists, artists),
    genres: mapTags(song.genres, genres),
    moods: mapTags(song.moods, moods),
  }
}
