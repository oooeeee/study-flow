import { useEffect, useState } from 'react';
import { listMovies } from '../api/client';
import type { Movie } from '../api/types';
import { AddMovieForm } from '../components/AddMovieForm';
import { WatchlistItem } from '../components/WatchlistItem';

export function WatchlistPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMovies = async () => {
    setIsLoading(true);
    setError('');
    try {
      const plannedMovies = await listMovies('planned');
      setMovies(plannedMovies);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load movies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleMovieAdded = (newMovie: Movie) => {
    setMovies([newMovie, ...movies]);
  };

  const handleMarkWatched = async (movieId: string) => {
    // Remove from planned list when marked as watched
    setMovies(movies.filter((m) => m.id !== movieId));
    // Optionally refetch to ensure sync
    await fetchMovies();
  };

  return (
    <div className="watchlist-page">
      <h1>Watchlist</h1>

      <section className="add-movie-section">
        <h2>Add a Movie</h2>
        <AddMovieForm onMovieAdded={handleMovieAdded} isLoading={isLoading} />
      </section>

      {error && <div className="error">{error}</div>}

      <section className="movies-list">
        <h2>Planned Movies ({movies.length})</h2>
        {isLoading && <p>Loading...</p>}
        {!isLoading && movies.length === 0 && (
          <p className="empty-state">No planned movies yet. Add one to get started!</p>
        )}
        <div className="movie-items">
          {movies.map((movie) => (
            <WatchlistItem
              key={movie.id}
              movie={movie}
              onMarkWatched={handleMarkWatched}
              isLoading={isLoading}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
