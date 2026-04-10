import { useEffect, useState } from 'react';
import { listMovies } from '../api/client';
import type { Movie } from '../api/types';
import { AddMovieForm } from '../components/AddMovieForm';
import { WatchlistItem } from '../components/WatchlistItem';
import { RateMovieModal } from '../components/RateMovieModal';

export function WatchlistPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleMarkWatched = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  const handleModalSave = async (ratedMovie: Movie) => {
    // Remove from planned list
    setMovies(movies.filter((m) => m.id !== ratedMovie.id));
    handleModalClose();
    // Refetch to ensure sync
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

      {selectedMovie && (
        <RateMovieModal
          movie={selectedMovie}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
