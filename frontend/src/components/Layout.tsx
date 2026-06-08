import { NavLink, Outlet } from 'react-router-dom'
import { FileSpreadsheet, ListTodo } from 'lucide-react'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md shadow-indigo-200">
                <ListTodo className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">LicitAlert</h1>
                <p className="text-xs text-gray-500 font-medium">Monitoramento de Licitações</p>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="flex space-x-2">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <ListTodo className="h-4 w-4" />
                <span>Licitações</span>
              </NavLink>
              <NavLink
                to="/import"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Importar Planilha</span>
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-400 font-medium">
          &copy; {new Date().getFullYear()} LicitAlert. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
