import { useEffect, useState, type RefObject } from 'react'

const SHOW_AFTER_PX = 160

interface ScrollToTopButtonProps {
  /** Nếu truyền containerRef thì theo dõi và cuộn phần tử đó thay vì window */
  containerRef?: RefObject<HTMLElement | null>
}

export default function ScrollToTopButton({ containerRef }: ScrollToTopButtonProps = {}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const target = containerRef?.current

    function onScroll() {
      const scrollTop = target ? target.scrollTop : window.scrollY || document.documentElement.scrollTop
      setVisible(scrollTop > SHOW_AFTER_PX)
    }

    onScroll()
    const eventTarget: HTMLElement | Window = target ?? window
    eventTarget.addEventListener('scroll', onScroll, { passive: true })
    return () => eventTarget.removeEventListener('scroll', onScroll)
  }, [containerRef])

  if (!visible) return null

  function scrollToTop() {
    if (containerRef?.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Cuộn về đầu trang"
      title="Cuộn về đầu trang"
      className="animate-pop-in fixed bottom-6 right-4 z-40 flex items-center gap-1.5 rounded-full bg-brand-500 px-3.5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-500/35 transition hover:-translate-y-0.5 hover:bg-brand-600 active:translate-y-0 md:right-8"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 19V5M12 5l-6 6M12 5l6 6"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>Đầu trang</span>
    </button>
  )
}
