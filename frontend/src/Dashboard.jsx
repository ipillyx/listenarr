import React, { useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8001'

export default function Dashboard({ token }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState({ google_books: [], prowlarr: [] })
  const [downloading, setDownloading] = useState(null)
  const [toast, setToast] = useState(null)

  // 🔍 Search both Google Books + Prowlarr
  const search = async (e, bookTitle) => {
    e?.preventDefault()
    const q = bookTitle || query
    if (!q.trim()) return
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.get(`${API}/search/`, {
        params: { q },
        headers: { Authorization: `Bearer ${token}` },
      })
      setResults({
        google_books: data.google_books || [],
        prowlarr: data.prowlarr || [],
      })
      if (bookTitle) setQuery(bookTitle)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  // 🎧 Send download to backend
  const handleDownload = async (release) => {
    try {
      setDownloading(release.guid)
      await axios.post(`${API}/prowlarr/download`, release, {
        headers: { Authorization: `Bearer ${token}` },
      })
      showToast(`💫 Queued "${release.title || release.name}" for download!`, 'success')
    } catch (err) {
      showToast(`💔 Failed: ${err?.response?.data?.detail || err.message}`, 'error')
    } finally {
      setDownloading(null)
    }
  }

  // Toast helper
  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // 🧠 Better torrent filtering
  const filteredProwlarr = results.prowlarr.filter(
    (item) =>
      item.indexer?.toLowerCase().includes('myanonamouse') &&
      /m4b|mp3|audiobook/i.test(item.title || '')
  )

  return (
    <div className="p-8 text-gray-200 relative bg-gradient-to-br from-black via-[#0a0a0f] to-[#1a0f12] min-h-screen">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg text-white ${toast.type === 'success'
            ? 'bg-rose-700'
            : toast.type === 'error'
              ? 'bg-red-800'
              : 'bg-gray-700'
            }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <nav className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-serif text-rose-600 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
          ♱ Listenarr Audiobooks
        </h1>
        <p className="italic text-sm text-gray-500">
          “For those who prefer their stories whispered in the dark.”
        </p>
      </nav>

      {/* Search Bar */}
      <form onSubmit={search} className="flex gap-2 mb-10">
        <input
          type="text"
          placeholder="Search for a romantic whisper or an audiobook..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-3 bg-[#121216] text-gray-200 rounded border border-[#3a1f24] focus:border-rose-600 focus:ring-1 focus:ring-rose-600 outline-none"
        />
        <button
          type="submit"
          className="bg-rose-700 hover:bg-rose-800 px-6 py-3 rounded font-semibold transition-all shadow-md hover:shadow-rose-700/40"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Results */}
      {!loading && !error && (results.google_books.length > 0 || filteredProwlarr.length > 0) && (
        <div className="space-y-12">
          {/* Google Books */}
          <div>
            <h2 className="text-2xl font-serif mb-4 text-rose-500">Whispers from Google Books</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {results.google_books.map((book, i) => (
                <div
                  key={i}
                  onClick={() => search(null, book.title)}
                  className="relative overflow-hidden rounded-xl bg-[#111] shadow-md hover:shadow-rose-600/40 transition-all cursor-pointer group"
                >
                  {book.cover ? (
                    <img
                      src={book.cover.replace(/zoom=\d+/, 'zoom=3')}
                      alt={book.title}
                      className="w-full h-[520px] object-contain bg-black transform group-hover:scale-105 transition duration-500 ease-in-out"
                    />
                  ) : (
                    <div className="w-full h-[520px] bg-gray-700 flex items-center justify-center text-gray-400 italic">
                      No Cover
                    </div>
                  )}
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="text-white font-bold text-lg truncate">{book.title}</div>
                    <div className="text-gray-300 text-sm">{book.author}</div>
                    <div className="text-rose-400 text-xs mt-1 opacity-0 group-hover:opacity-100 transition">
                      Click to seek its whispered version on MyAnonamouse
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MyAnonamouse Results */}
          <div>
            <h2 className="text-2xl font-serif mb-4 text-rose-500">
              Audiobooks from MyAnonamouse [ENG]
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProwlarr.map((item, i) => (
                <div
                  key={i}
                  className="bg-[#151418] border border-[#2b1b1f] rounded-lg p-4 shadow-md hover:shadow-rose-700/30 transition-all"
                >
                  {item.poster && (
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="w-full h-64 object-contain bg-black rounded mb-3"
                    />
                  )}
                  <div className="font-semibold text-lg mb-1 text-gray-100">
                    {item.title || item.name}
                  </div>
                  {item.size && (
                    <div className="text-sm text-gray-400 mb-1">
                      {(item.size / (1024 * 1024 * 1024)).toFixed(2)} GB
                    </div>
                  )}
                  <div className="text-sm text-gray-500 mb-2">
                    From: <span className="text-rose-400">{item.indexer}</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleDownload(item)}
                      disabled={downloading === item.guid}
                      className={`${downloading === item.guid
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-rose-700 hover:bg-rose-800'
                        } text-sm px-4 py-1.5 rounded transition-all`}
                    >
                      {downloading === item.guid ? 'Sending...' : 'Download'}
                    </button>
                    {item.infoUrl && (
                      <a
                        href={item.infoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-rose-400 text-sm underline px-3 py-1"
                      >
                        Open
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && !error && results.google_books.length === 0 && filteredProwlarr.length === 0 && (
        <div className="text-gray-500 italic mt-6 text-center">
          No whispers yet... try searching for something enchanting.
        </div>
      )}
    </div>
  )
}
