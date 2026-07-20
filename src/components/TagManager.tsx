import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { createTag, deleteTag, fetchTags, renameTag, type TagTable } from '../lib/api'
import type { Tag } from '../lib/types'
import { matchesSearch } from '../lib/text'
import { useMidnightPing } from '../hooks/useMidnightPing'

export interface TagManagerProps {
  table: TagTable
  pageTitle: string
  gradientWord: string
  hint: string
  accent: 'violet' | 'pink' | 'sky'
}

type SortField = 'name' | 'time'
type SortDir = 'asc' | 'desc'

const selectClass =
  'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-white/20'

export default function TagManager({ table, pageTitle, gradientWord, hint, accent }: TagManagerProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const badgeClass = {
    violet:
      'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-200',
    pink: 'border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-200',
    sky: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200',
  }[accent]

  const reload = useCallback(async () => {
    try {
      setTags(await fetchTags(table))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu.')
    } finally {
      setLoading(false)
    }
  }, [table])

  useEffect(() => {
    void reload()
  }, [reload])

  useMidnightPing(() => {
    void reload()
  })

  const displayed = useMemo(() => {
    const filtered = tags.filter((tag) => matchesSearch(tag.name, search))
    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0
      if (sortField === 'name') {
        cmp = a.name.localeCompare(b.name, 'vi')
      } else {
        cmp =
          new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [tags, search, sortField, sortDir])

  async function run(action: () => Promise<unknown>) {
    try {
      await action()
      await reload()
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra.'
      setError(message.includes('duplicate key') ? 'Tên này đã tồn tại rồi.' : message)
    }
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    await run(() => createTag(table, name))
    setNewName('')
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {pageTitle} <span className="text-gradient">{gradientWord}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {tags.length} mục
            {displayed.length !== tags.length ? ` · đang hiện ${displayed.length}` : ''}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{hint}</p>

        <form onSubmit={handleAdd} className="mb-4 flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Tên mới…"
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-slate-900/60"
          />
          <button
            type="submit"
            disabled={!newName.trim()}
            className="shrink-0 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/30 transition hover:bg-brand-600 disabled:opacity-40"
          >
            + Thêm
          </button>
        </form>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <div className="relative w-full sm:flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên (không cần dấu)…"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 pr-9 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-slate-900/60"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Xóa tìm kiếm"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-100"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className={selectClass}
            >
              <option value="name">Sắp xếp theo tên</option>
              <option value="time">Sắp xếp theo thời gian</option>
            </select>
            <select value={sortDir} onChange={(e) => setSortDir(e.target.value as SortDir)} className={selectClass}>
              <option value="asc">Tăng dần (A→Z / cũ→mới)</option>
              <option value="desc">Giảm dần (Z→A / mới→cũ)</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}

        {loading ? (
          <ul className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <li key={i} className="flex items-center gap-2">
                <div className="skeleton h-8 w-32 rounded-full" />
                <div className="ml-auto flex gap-1">
                  <div className="skeleton h-7 w-14 rounded-lg" />
                  <div className="skeleton h-7 w-10 rounded-lg" />
                </div>
              </li>
            ))}
          </ul>
        ) : tags.length === 0 ? (
          <p className="text-sm text-slate-400">Chưa có mục nào.</p>
        ) : displayed.length === 0 ? (
          <p className="text-sm text-slate-400">Không tìm thấy mục nào khớp từ khóa.</p>
        ) : (
          <ul className="space-y-2">
            {displayed.map((tag) => (
              <li key={tag.id} className="flex items-center gap-2">
                {editingId === tag.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-slate-900/60"
                    />
                    <button
                      onClick={() =>
                        void run(() => renameTag(table, tag.id, editName)).then(() => setEditingId(null))
                      }
                      disabled={!editName.trim()}
                      className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-40"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <>
                    <div className="min-w-0">
                      <span className={`inline-block rounded-full border px-3 py-1 text-sm ${badgeClass}`}>
                        {tag.name}
                      </span>
                      {sortField === 'time' && tag.created_at && (
                        <p className="mt-1 pl-1 text-xs text-slate-400">
                          {new Date(tag.created_at).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                    <div className="ml-auto flex shrink-0 gap-1">
                      <button
                        onClick={() => {
                          setEditingId(tag.id)
                          setEditName(tag.name)
                        }}
                        className="rounded-lg px-2.5 py-1 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white"
                      >
                        Đổi tên
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Xóa "${tag.name}"? Các bài hát sẽ tự bỏ nhãn này.`)) {
                            void run(() => deleteTag(table, tag.id))
                          }
                        }}
                        className="rounded-lg px-2.5 py-1 text-xs text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                      >
                        Xóa
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
