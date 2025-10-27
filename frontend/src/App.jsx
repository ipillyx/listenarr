import React, { useState, useEffect } from 'react'
import Login from './pages/Login.jsx'
import Dashboard from './Dashboard'

export default function App() {
  const [token, setToken] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('token')
    if (saved) setToken(saved)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  if (!token) {
    return <Login onLogin={setToken} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a0f] to-[#1a0f12] text-gray-200">
      {/* 🔮 Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 bg-[#111118] border-b border-[#2a1b1e] shadow-lg shadow-black/50">
        <div className="flex items-center gap-3">
          <span className="text-3xl text-rose-600 drop-shadow-[0_0_6px_rgba(244,63,94,0.5)] font-serif">
            ♱ Listenarr
          </span>
          <span className="text-sm italic text-gray-400">Audiobooks</span>
        </div>

        <button
          onClick={handleLogout}
          className="bg-rose-700 hover:bg-rose-800 text-white font-medium px-4 py-2 rounded transition-all shadow-md hover:shadow-rose-700/30"
        >
          Logout
        </button>
      </nav>

      {/* 🌙 Main Dashboard */}
      <main>
        <Dashboard token={token} />
      </main>
    </div>
  )
}
