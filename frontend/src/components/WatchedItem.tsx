import type { Movie } from "../api/types";

interface WatchedItemProps {
  movie: Movie;
}

export function WatchedItem({ movie }: WatchedItemProps) {
  return (
    <li>
      <span>
        {movie.title}
        {movie.year ? ` (${movie.year})` : ""}
      </span>
      {movie.rating !== null && <span> — Rating: {movie.rating}/10</span>}
      {movie.review && <p>{movie.review}</p>}
    </li>
  );
}
