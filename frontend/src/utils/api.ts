import axios from 'axios'

/** Deployed backend origin (e.g. https://parser-backend.onrender.com). Empty = use Vite proxy in dev. */
const apiRoot = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

const api = axios.create({
  baseURL: apiRoot ? `${apiRoot}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
