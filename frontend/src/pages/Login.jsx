import React, { useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8001'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        await axios.post(`${API}/auth/register`, { username, password })
      }

      const form = new URLSearchParams()
      form.append('username', username)
      form.append('password', password)
      const { data } = await axios.post(`${API}/auth/login`, form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      onLogin(data.access_token)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a0f] to-[#1a0f12] flex items-center justify-center text-gray-200">
      <div className="max-w-sm w-full bg-[#121216]/90 border border-[#2b1b1f] rounded-2xl shadow-2xl shadow-black/50 p-8 text-center backdrop-blur-sm">
        <h1 className="text-4xl font-serif mb-2 text-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)] glow">
          ♱ Listenarr
        </h1>
        <p className="text-sm italic text-gray-400 mb-6">
          “Where audiobooks come alive in the dark.”
        </p>

        {error && (
          <div className="mb-4 text-sm bg-rose-900/40 border border-rose-800 rounded p-2 text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1 text-left">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 bg-[#18181d] border border-[#3a1f24] focus:border-rose-600 focus:ring-rose-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1 text-left">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-[#18181d] border border-[#3a1f24] focus:border-rose-600 focus:ring-rose-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-700 hover:bg-rose-800 px-4 py-2 rounded-lg font-semibold text-white shadow-md hover:shadow-rose-700/40 transition-all"
          >
            {loading
              ? 'Whispering...'
              : mode === 'login'
              ? 'Enter the Library'
              : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-400">
          {mode === 'login' ? (
            <>
              <span>New here? </span>
              <button
                className="text-rose-500 hover:text-rose-400 transition-all underline"
                onClick={() => setMode('register')}
              >
                Register
              </button>
            </>
          ) : (
            <>
              <span>Already a member? </span>
              <button
                className="text-rose-500 hover:text-rose-400 transition-all underline"
                onClick={() => setMode('login')}
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
