import { useState } from 'react'
import type { Tag } from '../lib/types'

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
    active: 'border-violet-500 bg-violet-500/20 text-violet-200',
    ring: 'focus:border-violet-500 focus:ring-violet-500/30',
  },
  pink: {
    active: 'border-pink-500 bg-pink-500/20 text-pink-200',
    ring: 'focus:border-pink-500 focus:ring-pink-500/30',
  },
  sky: {
    active: 'border-sky-500 bg-sky-500/20 text-sky-200',
    ring: 'focus:border-sky-500 focus:ring-sky-500/30',
  },
}

export default function TagPicker({ label, tags, selectedIds, onToggle, onCreate, accent }: TagPickerProps) {
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const classes = accentClasses[accent]

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
      <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => {
          const active = selectedIds.includes(tag.id)
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onToggle(tag.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                active ? classes.active : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {tag.name}
            </button>
          )
        })}
        {tags.length === 0 && <span className="text-xs text-slate-500">Chưa có, thêm mới bên dưới.</span>}
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
          className={`w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs outline-none transition focus:ring-2 ${classes.ring}`}
        />
        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={creating || !newName.trim()}
          className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 disabled:opacity-40"
        >
          + Thêm
        </button>
      </div>
    </div>
  )
}
