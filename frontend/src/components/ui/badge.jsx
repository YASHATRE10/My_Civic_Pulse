import { cn } from '../../utils/cn'

export function Badge({ className, variant = 'default', ...props }) {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    success: 'bg-emerald-600 text-white',
    warning: 'bg-amber-500 text-black',
    danger: 'bg-rose-600 text-white',
    outline: 'bg-transparent border border-border text-foreground',
  }

  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', variants[variant], className)}
      {...props}
    />
  )
}
