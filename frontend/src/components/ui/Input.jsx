export default function Input({
  label,
  id,
  type = 'text',
  error,
  icon,
  className = '',
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          className={`w-full h-12 ${icon ? 'pl-10' : 'pl-4'} pr-4 bg-surface-container-low ghost-border rounded-lg text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:bg-white transition-all duration-200 text-sm ${error ? 'ring-2 ring-error' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-error ml-1 mt-1">{error}</p>}
    </div>
  )
}
