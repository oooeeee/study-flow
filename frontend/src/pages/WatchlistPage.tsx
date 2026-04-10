import { useEffect, useState } from 'react'
import { listMovies } from '../api/client'
import type { Movie } from '../api/types'
import { AddMovieForm } from '../components/AddMovieForm'
import { WatchlistItem } from '../components/WatchlistItem'

interface WatchlistPageProps {
  onMarkWatched: (id: string) => void
}

export function WatchlistPage({ onMarkWatched }: WatchlistPageProps) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchMovies() {
    setLoading(true)
    setError(null)
    try {
      const data = await listMovies('planned')
      setMovies(data)
    } catch {
      setError('Failed to load watchlist')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMovies()
  }, [])

  return (
    <div>
      <h2>Watchlist</h2>
      <AddMovieForm onAdded={fetchMovies} />
      {loading && <p>Loading...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && movies.length === 0 && <p>No movies in watchlist</p>}
      <ul>
        {movies.map((movie) => (
          <li key={movie.id}>
            <WatchlistItem movie={movie} onMarkWatched={onMarkWatched} />
          </li>
        ))}
      </ul>
    </div>
  )
}
