import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// 👇 This line ensures VITE_API_URL is used and gets baked into the bundle
console.log("🔥 VITE_API_URL =", import.meta.env.VITE_API_URL);

// Optional: make it globally accessible
window.API_URL = import.meta.env.VITE_API_URL;

createRoot(document.getElementById('root')).render(<App />)
