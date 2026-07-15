import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

export default function LoginPage() {
  const { session, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (session) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const message = await signIn(email, password)
    setSubmitting(false)
    if (message) setError(message)
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-4xl shadow-2xl shadow-violet-900/50">
            🎤
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Kho bài hát <span className="text-gradient">Karaoke</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">Đăng nhập để tiếp tục</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
            Chưa cấu hình Supabase. Hãy tạo file <code className="font-mono">.env</code> từ{' '}
            <code className="font-mono">.env.example</code> và điền URL + anon key (xem README).
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur"
        >
          <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
            placeholder="ban@email.com"
          />

          <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="password">
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-5 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
            placeholder="••••••••"
          />

          {error && (
            <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Ứng dụng cá nhân · Dữ liệu được bảo vệ bằng Supabase RLS
        </p>
      </div>
    </div>
  )
}
