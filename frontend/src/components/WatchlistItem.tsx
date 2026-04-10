import type { Movie } from '../api/types';

interface WatchlistItemProps {
  movie: Movie;
  onMarkWatched?: (movie: Movie) => void;
  isLoading?: boolean;
}

export function WatchlistItem({ movie, onMarkWatched, isLoading = false }: WatchlistItemProps) {
  const handleMarkWatched = () => {
    onMarkWatched?.(movie);
  };

  return (
    <div className="watchlist-item">
      <div className="movie-info">
        <h3>{movie.title}</h3>
        {movie.year && <p className="year">{movie.year}</p>}
      </div>
      <button
        onClick={handleMarkWatched}
        disabled={isLoading}
        className="mark-watched-btn"
      >
        Mark as Watched
      </button>
    </div>
  );
}
