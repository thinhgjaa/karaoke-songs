import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ScrollToTopButton from './ScrollToTopButton'

const navItems = [
  { to: '/', end: true, icon: '🎵', label: 'Bài hát' },
  { to: '/ca-si', end: false, icon: '🎤', label: 'Ca sĩ' },
  { to: '/the-loai', end: false, icon: '🎸', label: 'Thể loại' },
  { to: '/tam-trang', end: false, icon: '💫', label: 'Tâm trạng' },
] as const

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
  }`

function Logo({ size = 'md' }: { size?: 'md' | 'sm' }) {
  const cls = size === 'sm' ? 'h-8 w-8 text-base' : 'h-9 w-9 text-lg'
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-fuchsia-500 shadow-md shadow-brand-500/30 ${cls}`}
    >
      🎤
    </span>
  )
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
    >
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 14.3A9 9 0 1 1 9.7 3a7 7 0 0 0 11.3 11.3z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}

function MenuButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? 'Đóng menu' : 'Mở menu'}
      aria-expanded={open}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 md:hidden"
    >
      {open ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </button>
  )
}

interface SidebarPanelProps {
  onNavigate?: () => void
  showClose?: boolean
  onClose?: () => void
}

function SidebarPanel({ onNavigate, showClose, onClose }: SidebarPanelProps) {
  const { signOut } = useAuth()

  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-4 dark:border-white/5">
        <div className="flex min-w-0 items-center gap-2.5">
          <Logo />
          <span className="truncate text-sm font-bold text-slate-900 dark:text-white">
            Kho bài hát <span className="text-gradient">Karaoke</span>
          </span>
        </div>
        {showClose && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng menu"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Menu</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={navLinkClass}
            onClick={onNavigate}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-slate-100 p-3 dark:border-white/5">
        <div className="flex items-center justify-between gap-2 rounded-lg px-3 py-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Giao diện</span>
          <ThemeToggle />
        </div>
        <button
          onClick={() => void signOut()}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
        >
          <span aria-hidden="true">↩</span> Đăng xuất
        </button>
      </div>
    </>
  )
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [mobileOpen])

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar cố định — laptop/desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 md:flex">
        <SidebarPanel />
      </aside>

      {/* Drawer sidebar — mobile */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out dark:border-white/10 dark:bg-slate-900 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Menu điều hướng"
        >
          <SidebarPanel
            showClose
            onClose={() => setMobileOpen(false)}
            onNavigate={() => setMobileOpen(false)}
          />
        </aside>
      </div>

      {/* Nội dung chính */}
      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        {/* Header mobile */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-slate-950/90 md:hidden">
          <MenuButton open={mobileOpen} onClick={() => setMobileOpen((v) => !v)} />
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Logo size="sm" />
            <span className="truncate text-sm font-bold text-slate-900 dark:text-white">
              Kho bài hát <span className="text-gradient">Karaoke</span>
            </span>
          </div>
          <ThemeToggle />
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-8">
          <Outlet />
        </main>

        <ScrollToTopButton />
      </div>
    </div>
  )
}
