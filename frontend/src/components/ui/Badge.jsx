const variants = {
  primary: 'bg-primary-container text-white',
  secondary: 'bg-secondary-fixed text-on-secondary-fixed',
  success: 'bg-emerald-600 text-white',
  warning: 'bg-amber-500 text-white',
  error: 'bg-error text-white',
  neutral: 'bg-slate-500 text-white',
  outline: 'border border-outline-variant/40 text-on-surface-variant bg-transparent',
  gerente: 'bg-teal-600 text-white',
  contador: 'bg-amber-600 text-white',
  empleado: 'bg-slate-500 text-white',
  lider: 'bg-indigo-600 text-white',
}

export default function Badge({ children, variant = 'primary', className = '' }) {
  const cls = variants[variant] || variants.primary
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${cls} ${className}`}
    >
      {children}
    </span>
  )
}
