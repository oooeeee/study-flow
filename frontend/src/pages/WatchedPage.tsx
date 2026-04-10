import { useEffect, useState } from 'react'
import { listMovies } from '../api/client'
import type { Movie } from '../api/types'
import { WatchedItem } from '../components/WatchedItem'

export function WatchedPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchMovies() {
    setLoading(true)
    setError(null)
    try {
      const data = await listMovies('watched')
      const sorted = [...data].sort((a, b) => {
        if (!a.watched_at) return 1
        if (!b.watched_at) return -1
        return new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime()
      })
      setMovies(sorted)
    } catch {
      setError('Failed to load watched movies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMovies()
  }, [])

  return (
    <div>
      <h2>Watched</h2>
      {loading && <p>Loading...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && movies.length === 0 && <p>No watched movies yet</p>}
      <ul>
        {movies.map((movie) => (
          <li key={movie.id}>
            <WatchedItem movie={movie} />
          </li>
        ))}
      </ul>
    </div>
  )
}
