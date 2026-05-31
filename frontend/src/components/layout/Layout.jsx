import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="ml-[220px] flex-1 flex flex-col min-h-screen">
        <Topbar />
        <div className="flex-1 p-10">{children}</div>
      </main>
    </div>
  )
}
