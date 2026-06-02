export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  className = '',
  disabled,
  loading,
  ...props
}) {
  const sizes = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-sm',
  }

  const variants = {
    primary:
      'primary-gradient text-white font-semibold rounded-md editorial-shadow hover:opacity-90 active:scale-[0.98] transition-all duration-150',
    secondary:
      'bg-transparent border border-outline/20 text-primary font-semibold rounded-md hover:bg-surface-container transition-colors',
    ghost:
      'bg-transparent text-on-surface-variant font-medium rounded-md hover:bg-surface-container transition-colors',
    danger:
      'bg-error text-white font-semibold rounded-md hover:opacity-90 active:scale-[0.98] transition-all duration-150',
  }

  return (
    <button
      className={`inline-flex items-center gap-2 ${sizes[size]} ${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined text-lg animate-spin">autorenew</span>
      ) : (
        icon && <span className="material-symbols-outlined text-lg">{icon}</span>
      )}
      {children}
      {iconRight && !loading && (
        <span className="material-symbols-outlined text-lg">{iconRight}</span>
      )}
    </button>
  )
}
