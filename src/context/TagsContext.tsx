import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { createTag, deleteTag, fetchTags, renameTag, type TagTable } from '../lib/api'
import type { Tag } from '../lib/types'
import { useAuth } from './AuthContext'
import { useMidnightPing } from '../hooks/useMidnightPing'

interface TagsContextValue {
  artists: Tag[]
  genres: Tag[]
  moods: Tag[]
  loading: boolean
  refreshTags: () => Promise<void>
  createTagAndCache: (table: TagTable, name: string) => Promise<Tag>
  renameTagAndCache: (table: TagTable, id: string, name: string) => Promise<void>
  deleteTagAndCache: (table: TagTable, id: string) => Promise<void>
  tagsFor: (table: TagTable) => Tag[]
}

const TagsContext = createContext<TagsContextValue | null>(null)

function setTableTags(
  table: TagTable,
  setArtists: (v: Tag[]) => void,
  setGenres: (v: Tag[]) => void,
  setMoods: (v: Tag[]) => void,
  updater: (prev: Tag[]) => Tag[],
) {
  if (table === 'artists') setArtists((prev) => updater(prev))
  else if (table === 'genres') setGenres((prev) => updater(prev))
  else setMoods((prev) => updater(prev))
}

export function TagsProvider() {
  const { session } = useAuth()
  const [artists, setArtists] = useState<Tag[]>([])
  const [genres, setGenres] = useState<Tag[]>([])
  const [moods, setMoods] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  const refreshTags = useCallback(async () => {
    const [artistData, genreData, moodData] = await Promise.all([
      fetchTags('artists'),
      fetchTags('genres'),
      fetchTags('moods'),
    ])
    setArtists(artistData)
    setGenres(genreData)
    setMoods(moodData)
  }, [])

  useEffect(() => {
    if (!session) {
      setArtists([])
      setGenres([])
      setMoods([])
      setLoading(false)
      return
    }

    setLoading(true)
    void refreshTags()
      .catch(() => {
        /* lỗi do trang con xử lý khi cần */
      })
      .finally(() => setLoading(false))
  }, [session, refreshTags])

  useMidnightPing(() => {
    if (session) void refreshTags()
  }, Boolean(session))

  const tagsFor = useCallback(
    (table: TagTable) => {
      if (table === 'artists') return artists
      if (table === 'genres') return genres
      return moods
    },
    [artists, genres, moods],
  )

  const createTagAndCache = useCallback(
    async (table: TagTable, name: string) => {
      const tag = await createTag(table, name)
      setTableTags(table, setArtists, setGenres, setMoods, (prev) =>
        [...prev, tag].sort((a, b) => a.name.localeCompare(b.name, 'vi')),
      )
      return tag
    },
    [],
  )

  const renameTagAndCache = useCallback(async (table: TagTable, id: string, name: string) => {
    await renameTag(table, id, name.trim())
    const trimmed = name.trim()
    setTableTags(table, setArtists, setGenres, setMoods, (prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: trimmed } : t)),
    )
  }, [])

  const deleteTagAndCache = useCallback(async (table: TagTable, id: string) => {
    await deleteTag(table, id)
    setTableTags(table, setArtists, setGenres, setMoods, (prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <TagsContext.Provider
      value={{
        artists,
        genres,
        moods,
        loading,
        refreshTags,
        createTagAndCache,
        renameTagAndCache,
        deleteTagAndCache,
        tagsFor,
      }}
    >
      <Outlet />
    </TagsContext.Provider>
  )
}

export function useTags(): TagsContextValue {
  const ctx = useContext(TagsContext)
  if (!ctx) throw new Error('useTags must be used within TagsProvider')
  return ctx
}
