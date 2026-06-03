import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Credenciales incorrectas. Verifique su correo y contraseña.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen w-full overflow-hidden">
      {/* Left — Branding */}
      <section className="hidden md:flex md:w-1/2 bg-primary-container relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-gradient-to-br from-white to-transparent" />

        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="mb-8 p-4 rounded-xl bg-white/10 backdrop-blur-md inline-flex items-center justify-center">
            <span
              className="material-symbols-outlined text-white text-6xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              corporate_fare
            </span>
          </div>
          <h1 className="text-white text-5xl font-extrabold tracking-tight mb-4">TalentOS</h1>
          <p className="text-white/80 text-xl font-medium max-w-md leading-relaxed">
            Sistema de Gestión de Recursos Humanos
          </p>

          <div className="mt-24 flex items-center gap-4 text-primary-fixed-dim/40">
            <div className="h-px w-12 bg-current" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary-fixed-dim/60">
              Arquitectura de Talento
            </span>
            <div className="h-px w-12 bg-current" />
          </div>
        </div>
      </section>

      {/* Right — Form */}
      <section className="w-full md:w-1/2 bg-surface-container-lowest flex items-center justify-center p-8 md:p-16 lg:p-24">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-3 mb-12">
            <span
              className="material-symbols-outlined text-primary text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              corporate_fare
            </span>
            <div>
              <h2 className="text-primary font-bold text-xl leading-none">TalentOS</h2>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                Gestión de RRHH
              </p>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-on-surface tracking-tight mb-2">
              Bienvenido de nuevo
            </h2>
            <p className="text-on-surface-variant text-sm">
              Ingrese sus credenciales para acceder al sistema.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-error-container rounded-lg">
              <span className="material-symbols-outlined text-error text-lg mt-0.5 flex-shrink-0">
                error
              </span>
              <p className="text-sm text-on-error-container font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@empresa.com"
                required
                autoComplete="email"
                className="w-full h-14 px-4 bg-surface-container-low ghost-border rounded-lg text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:bg-white transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full h-14 px-4 pr-12 bg-surface-container-low ghost-border rounded-lg text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:bg-white transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPass ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 primary-gradient text-white font-bold rounded-lg editorial-shadow active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 group disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">
                      autorenew
                    </span>
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar sesión</span>
                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-2">
              <a
                href="#"
                className="text-[13px] font-medium text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline"
              >
                Olvidé mi contraseña
              </a>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-20 flex flex-col gap-6">
            <div className="h-px w-full bg-outline-variant/20" />
            <div className="flex justify-between items-center text-[10px] text-outline font-medium uppercase tracking-widest">
              <span>TalentOS © 2025</span>
              <div className="flex gap-4">
                <a href="#" className="hover:text-primary transition-colors">
                  Soporte
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  Privacidad
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
