import type { Movie } from "../api/types";

interface WatchlistItemProps {
  movie: Movie;
  onMarkWatched: (id: string) => void;
}

export function WatchlistItem({ movie, onMarkWatched }: WatchlistItemProps) {
  return (
    <li>
      <span>
        {movie.title}
        {movie.year ? ` (${movie.year})` : ""}
      </span>
      <button onClick={() => onMarkWatched(movie.id)}>Mark as watched</button>
    </li>
  );
}
