import { useEffect, useState } from 'react';
import { listMovies } from '../api/client';
import type { Movie } from '../api/types';
import { WatchedItem } from '../components/WatchedItem';

export function WatchedPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMovies = async () => {
    setIsLoading(true);
    setError('');
    try {
      const watchedMovies = await listMovies('watched');
      // Sort by watched_at descending (most recent first)
      const sorted = watchedMovies.sort((a, b) => {
        if (!a.watched_at || !b.watched_at) return 0;
        return new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime();
      });
      setMovies(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load movies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <div className="watched-page">
      <h1>Watched Movies</h1>

      {error && <div className="error">{error}</div>}

      <section className="movies-list">
        <h2>Watched ({movies.length})</h2>
        {isLoading && <p>Loading...</p>}
        {!isLoading && movies.length === 0 && (
          <p className="empty-state">No watched movies yet. Mark one from your watchlist!</p>
        )}
        <div className="movie-items">
          {movies.map((movie) => (
            <WatchedItem key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
}
