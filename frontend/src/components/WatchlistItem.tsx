import { useState } from "react";
import type { Movie } from "../api/types";
import { RateMovieModal } from "./RateMovieModal";

interface WatchlistItemProps {
  movie: Movie;
  onMarkWatched: (id: string) => void;
}

export function WatchlistItem({ movie, onMarkWatched }: WatchlistItemProps) {
  const [showModal, setShowModal] = useState(false);

  function handleSave() {
    setShowModal(false);
    onMarkWatched(movie.id);
  }

  return (
    <li>
      <span>
        {movie.title}
        {movie.year ? ` (${movie.year})` : ""}
      </span>
      <button onClick={() => setShowModal(true)}>Mark as watched</button>
      {showModal && (
        <RateMovieModal
          movieId={movie.id}
          movieTitle={movie.title}
          onSave={handleSave}
          onCancel={() => setShowModal(false)}
        />
      )}
    </li>
  );
}
