import type { Movie } from '../api/types';

interface WatchedItemProps {
  movie: Movie;
}

function renderStars(rating: number | null) {
  if (!rating) return 'Not rated';
  return '⭐'.repeat(Math.round(rating / 2)) + ` ${rating}/10`;
}

export function WatchedItem({ movie }: WatchedItemProps) {
  return (
    <div className="watched-item">
      <div className="movie-info">
        <h3>{movie.title}</h3>
        {movie.year && <p className="year">{movie.year}</p>}
      </div>
      <div className="movie-rating">
        <p className="rating">{renderStars(movie.rating)}</p>
        {movie.review && <p className="review">{movie.review}</p>}
      </div>
    </div>
  );
}
