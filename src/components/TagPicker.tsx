import { useState } from 'react'
import type { Tag } from '../lib/types'
import { matchesSearch } from '../lib/text'

interface TagPickerProps {
  label: string
  tags: Tag[]
  selectedIds: string[]
  onToggle: (id: string) => void
  onCreate: (name: string) => Promise<void>
  accent: 'violet' | 'pink' | 'sky'
}

const accentClasses = {
  violet: {
    active: 'border-brand-500 bg-brand-50 text-brand-700',
    ring: 'focus:border-brand-500 focus:ring-brand-500/20',
  },
  pink: {
    active: 'border-pink-500 bg-pink-50 text-pink-700',
    ring: 'focus:border-pink-500 focus:ring-pink-500/20',
  },
  sky: {
    active: 'border-sky-500 bg-sky-50 text-sky-700',
    ring: 'focus:border-sky-500 focus:ring-sky-500/20',
  },
}

export default function TagPicker({ label, tags, selectedIds, onToggle, onCreate, accent }: TagPickerProps) {
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [filter, setFilter] = useState('')
  const classes = accentClasses[accent]

  // Tag đã chọn luôn hiện để còn bỏ chọn được, dù không khớp từ khóa lọc
  const visibleTags = tags.filter(
    (tag) => selectedIds.includes(tag.id) || matchesSearch(tag.name, filter),
  )

  async function handleCreate() {
    const name = newName.trim()
    if (!name) return
    setCreating(true)
    try {
      await onCreate(name)
      setNewName('')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {tags.length > 6 && (
        <div className="relative mb-2">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Gõ để lọc nhanh (không cần dấu)…"
            className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 pr-8 text-xs shadow-sm outline-none transition focus:ring-2 ${classes.ring}`}
          />
          {filter && (
            <button
              type="button"
              onClick={() => setFilter('')}
              aria-label="Xóa lọc"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {visibleTags.map((tag) => {
          const active = selectedIds.includes(tag.id)
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onToggle(tag.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                active ? classes.active : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800'
              }`}
            >
              {tag.name}
            </button>
          )
        })}
        {tags.length === 0 && <span className="text-xs text-slate-400">Chưa có, thêm mới bên dưới.</span>}
        {tags.length > 0 && visibleTags.length === 0 && (
          <span className="text-xs text-slate-400">Không có tag nào khớp "{filter}".</span>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void handleCreate()
            }
          }}
          placeholder="Thêm mới nhanh…"
          className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm outline-none transition focus:ring-2 ${classes.ring}`}
        />
        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={creating || !newName.trim()}
          className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
        >
          + Thêm
        </button>
      </div>
    </div>
  )
}
