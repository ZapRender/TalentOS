import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/layout/Layout'

// Auth
import LoginPage from '../pages/auth/LoginPage'

// Dashboard
import DashboardPage from '../pages/dashboard/DashboardPage'

// Usuarios
import UsuariosPage from '../pages/usuarios/UsuariosPage'

// Empleados
import EmpleadosPage from '../pages/empleados/EmpleadosPage'
import EmpleadoPerfilPage from '../pages/empleados/EmpleadoPerfilPage'
import EmpleadoNuevoPage from '../pages/empleados/EmpleadoNuevoPage'
import HojaVidaPage from '../pages/empleados/HojaVidaPage'
import DocumentosPage from '../pages/empleados/DocumentosPage'

// Selección
import SeleccionPage from '../pages/seleccion/SeleccionPage'
import CandidatosPage from '../pages/seleccion/CandidatosPage'
import CandidatoPerfilPage from '../pages/seleccion/CandidatoPerfilPage'
import CandidatoNuevoPage from '../pages/seleccion/CandidatoNuevoPage'
import RequerimientosPage from '../pages/seleccion/RequerimientosPage'

// Nómina
import NominaPage from '../pages/nomina/NominaPage'
import PeriodosPage from '../pages/nomina/PeriodosPage'
import NovedadesPage from '../pages/nomina/NovedadesPage'
import ResultadoLiquidacionPage from '../pages/nomina/ResultadoLiquidacionPage'
import DetalleConceptosPage from '../pages/nomina/DetalleConceptosPage'
import DetalleLiquidacionPage from '../pages/nomina/DetalleLiquidacionPage'
import FlujAprobacionPage from '../pages/nomina/FlujAprobacionPage'
import DesprendiblesPage from '../pages/nomina/DesprendiblesPage'
import LiquidacionContratoPage from '../pages/nomina/LiquidacionContratoPage'
import AprobacionContadorPage from '../pages/nomina/AprobacionContadorPage'

// Afiliaciones
import AfiliacionesPage from '../pages/afiliaciones/AfiliacionesPage'
import AfiliacionNuevaPage from '../pages/afiliaciones/AfiliacionNuevaPage'
import AfiliacionesEmpleadoPage from '../pages/afiliaciones/AfiliacionesEmpleadoPage'
import PILAPage from '../pages/afiliaciones/PILAPage'

// Capacitación y más
import CapacitacionPage from '../pages/capacitacion/CapacitacionPage'
import DetalleCapacitacionPage from '../pages/capacitacion/DetalleCapacitacionPage'
import RetiroPage from '../pages/capacitacion/RetiroPage'
import ImplementosPage from '../pages/capacitacion/ImplementosPage'
import CartaNoRenovacionPage from '../pages/capacitacion/CartaNoRenovacionPage'
import CertificacionPage from '../pages/capacitacion/CertificacionPage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="material-symbols-outlined text-4xl text-primary-container animate-spin">
          autorenew
        </span>
      </div>
    )
  }
  return user ? children : <Navigate to="/login" replace />
}

function AppLayout({ children }) {
  return (
    <PrivateRoute>
      <Layout>{children}</Layout>
    </PrivateRoute>
  )
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
      <Route path="/usuarios" element={<AppLayout><UsuariosPage /></AppLayout>} />

      <Route path="/empleados" element={<AppLayout><EmpleadosPage /></AppLayout>} />
      <Route path="/empleados/nuevo" element={<AppLayout><EmpleadoNuevoPage /></AppLayout>} />
      <Route path="/empleados/:id" element={<AppLayout><EmpleadoPerfilPage /></AppLayout>} />
      <Route path="/empleados/:id/hoja-vida" element={<AppLayout><HojaVidaPage /></AppLayout>} />
      <Route path="/empleados/:id/documentos" element={<AppLayout><DocumentosPage /></AppLayout>} />
      <Route path="/empleados/:id/retiro" element={<AppLayout><RetiroPage /></AppLayout>} />
      <Route path="/empleados/:id/retiro/implementos" element={<AppLayout><ImplementosPage /></AppLayout>} />
      <Route path="/empleados/:id/retiro/carta" element={<AppLayout><CartaNoRenovacionPage /></AppLayout>} />
      <Route path="/empleados/:id/certificacion" element={<AppLayout><CertificacionPage /></AppLayout>} />
      <Route path="/empleados/:id/afiliaciones" element={<AppLayout><AfiliacionesEmpleadoPage /></AppLayout>} />

      <Route path="/seleccion" element={<AppLayout><SeleccionPage /></AppLayout>} />
      <Route path="/seleccion/candidatos" element={<AppLayout><CandidatosPage /></AppLayout>} />
      <Route path="/seleccion/candidatos/nuevo" element={<AppLayout><CandidatoNuevoPage /></AppLayout>} />
      <Route path="/seleccion/candidatos/:id" element={<AppLayout><CandidatoPerfilPage /></AppLayout>} />
      <Route path="/seleccion/requerimientos" element={<AppLayout><RequerimientosPage /></AppLayout>} />

      <Route path="/nomina" element={<AppLayout><NominaPage /></AppLayout>} />
      <Route path="/nomina/periodos" element={<AppLayout><PeriodosPage /></AppLayout>} />
      <Route path="/nomina/periodos/:id/novedades" element={<AppLayout><NovedadesPage /></AppLayout>} />
      <Route path="/nomina/periodos/:id/resultado" element={<AppLayout><ResultadoLiquidacionPage /></AppLayout>} />
      <Route path="/nomina/periodos/:id/empleado/:eid" element={<AppLayout><DetalleConceptosPage /></AppLayout>} />
      <Route path="/nomina/liquidacion/:id" element={<AppLayout><DetalleLiquidacionPage /></AppLayout>} />
      <Route path="/nomina/periodos/:id/aprobar" element={<AppLayout><FlujAprobacionPage /></AppLayout>} />
      <Route path="/nomina/periodos/:id/desprendibles" element={<AppLayout><DesprendiblesPage /></AppLayout>} />
      <Route path="/nomina/liquidacion-contrato" element={<AppLayout><LiquidacionContratoPage /></AppLayout>} />
      <Route path="/nomina/liquidacion-contrato/:id/aprobar" element={<AppLayout><AprobacionContadorPage /></AppLayout>} />

      <Route path="/afiliaciones" element={<AppLayout><AfiliacionesPage /></AppLayout>} />
      <Route path="/afiliaciones/nueva" element={<AppLayout><AfiliacionNuevaPage /></AppLayout>} />

      <Route path="/nomina/pila" element={<AppLayout><PILAPage /></AppLayout>} />

      <Route path="/capacitacion" element={<AppLayout><CapacitacionPage /></AppLayout>} />
      <Route path="/capacitacion/:id" element={<AppLayout><DetalleCapacitacionPage /></AppLayout>} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
