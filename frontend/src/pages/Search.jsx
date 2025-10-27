import React, { useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Search({ token }){
  const [q, setQ] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await axios.get(`${API}/books/search`, {
        params: { q },
        headers: { Authorization: `Bearer ${token}` }
      })
      setItems(data)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={search} className="flex gap-2 mb-4">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search Google Books…" className="flex-1 bg-gray-800 p-2" />
        <button className="px-4 bg-blue-600 hover:bg-blue-700">{loading ? 'Searching…' : 'Search'}</button>
      </form>

      {error && <div className="text-red-400 mb-2">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(b => (
          <div key={b.id} className="card">
            {b.thumbnail && <img src={b.thumbnail} alt={b.title} className="w-full h-56 object-cover rounded-xl mb-3" />}
            <div className="text-lg font-semibold">{b.title}</div>
            <div className="text-sm text-gray-400">{(b.authors || []).join(', ')}</div>
            {b.description && <p className="text-sm mt-2 line-clamp-4">{b.description}</p>}
            <div className="mt-3">
              <button className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700">Add</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
