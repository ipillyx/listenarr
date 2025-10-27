import React from 'react'

export default function NavBar({ token, onLogout }){
  return (
    <div className="w-full border-b border-gray-800 bg-gray-900/60 backdrop-blur sticky top-0">
      <div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
        <div className="text-xl font-bold">📚 Shaunarr</div>
        <div className="space-x-3">
          {token ? (
            <button className="px-3 py-1 bg-red-600 hover:bg-red-700" onClick={onLogout}>Logout</button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
