interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md'
}

export default function StarRating({ value, onChange, size = 'sm' }: StarRatingProps) {
  const interactive = Boolean(onChange)
  const sizeClass = size === 'md' ? 'text-2xl' : 'text-base'

  return (
    <div className={`flex items-center gap-0.5 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star === value ? 0 : star)}
          className={`${interactive ? 'cursor-pointer transition hover:scale-125' : 'cursor-default'} ${
            star <= value ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'
          }`}
          aria-label={`${star} sao`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
