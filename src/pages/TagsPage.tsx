import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { createTag, deleteTag, fetchTags, renameTag, type TagTable } from '../lib/api'
import type { Tag } from '../lib/types'

interface TagSectionProps {
  table: TagTable
  title: string
  hint: string
  accent: 'violet' | 'pink' | 'sky'
}

function TagSection({ table, title, hint, accent }: TagSectionProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const badgeClass = {
    violet: 'border-brand-200 bg-brand-50 text-brand-700',
    pink: 'border-pink-200 bg-pink-50 text-pink-700',
    sky: 'border-sky-200 bg-sky-50 text-sky-700',
  }[accent]

  const reload = useCallback(async () => {
    try {
      setTags(await fetchTags(table))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu.')
    }
  }, [table])

  useEffect(() => {
    void reload()
  }, [reload])

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
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-bold text-slate-900">{title}</h2>
      <p className="mb-4 mt-0.5 text-xs text-slate-500">{hint}</p>

      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Tên mới…"
          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          className="shrink-0 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/30 transition hover:bg-brand-600 disabled:opacity-40"
        >
          + Thêm
        </button>
      </form>

      {error && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {tags.length === 0 ? (
        <p className="text-sm text-slate-400">Chưa có mục nào.</p>
      ) : (
        <ul className="space-y-2">
          {tags.map((tag) => (
            <li key={tag.id} className="flex items-center gap-2">
              {editingId === tag.id ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm outline-none focus:border-brand-500"
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
                    className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                </>
              ) : (
                <>
                  <span className={`rounded-full border px-3 py-1 text-sm ${badgeClass}`}>{tag.name}</span>
                  <div className="ml-auto flex gap-1">
                    <button
                      onClick={() => {
                        setEditingId(tag.id)
                        setEditName(tag.name)
                      }}
                      className="rounded-lg px-2.5 py-1 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      Đổi tên
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Xóa "${tag.name}"? Các bài hát sẽ tự bỏ nhãn này.`)) {
                          void run(() => deleteTag(table, tag.id))
                        }
                      }}
                      className="rounded-lg px-2.5 py-1 text-xs text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
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
  )
}

export default function TagsPage() {
  return (
    <div>
      <h1 className="mb-5 text-xl font-bold text-slate-900">
        Ca sĩ, Thể loại &amp; <span className="text-gradient">Tâm trạng</span>
      </h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TagSection
          table="artists"
          title="Ca sĩ"
          hint="Ví dụ: Sơn Tùng M-TP, Mỹ Tâm, Đen Vâu…"
          accent="sky"
        />
        <TagSection
          table="genres"
          title="Thể loại"
          hint="Ví dụ: Nhạc trẻ, Bolero, Nhạc vàng, Remix, Rap…"
          accent="violet"
        />
        <TagSection
          table="moods"
          title="Tâm trạng"
          hint="Ví dụ: Sôi động, Trầm lắng, Tình cảm, Vui nhộn…"
          accent="pink"
        />
      </div>
    </div>
  )
}
