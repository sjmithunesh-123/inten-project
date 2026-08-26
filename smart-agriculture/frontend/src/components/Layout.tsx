import { BarChart3, Leaf, LogOut, Menu, ScanLine, UserCircle2, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo/smart-agriculture-logo.svg'

export function Layout() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand-wrap" aria-label="Smart Agriculture home">
          <img src={logo} className="brand-logo" alt="Smart Agriculture" />
        </NavLink>
        <button type="button" className="menu-toggle" aria-label="Toggle navigation" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/crops">Crops</NavLink>
          <NavLink to="/disease"><ScanLine size={15} /> Disease Scan</NavLink>
          <NavLink to="/crops#library"><Leaf size={15} /> Crop Library</NavLink>
          {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        </nav>

        {user ? (
          <div className="user-actions">
            <div className="user-pill">
              <UserCircle2 size={18} />
              <span>{user.full_name}</span>
            </div>
            <button type="button" className="logout-button" onClick={logout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        ) : (
          <div className="user-actions">
            <NavLink to="/login" className="ghost-link">
              Login
            </NavLink>
            <NavLink to="/register" className="primary-link">
              Register
            </NavLink>
          </div>
        )}
      </header>

      <main className="page-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div>
          <BarChart3 size={16} />
          <span>Precision farming insights for modern growers</span>
        </div>
      </footer>
    </div>
  )
}
