import { useEffect, useState } from "react";
import type { Movie } from "../api/types";
import { listMovies } from "../api/client";
import { AddMovieForm } from "../components/AddMovieForm";
import { WatchlistItem } from "../components/WatchlistItem";

interface WatchlistPageProps {
  onMarkWatched: (id: string) => void;
}

export function WatchlistPage({ onMarkWatched }: WatchlistPageProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchMovies() {
    setLoading(true);
    setError(null);
    try {
      const data = await listMovies("planned");
      setMovies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load movies");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMovies();
  }, []);

  function handleMarkWatched(id: string) {
    setMovies((currentMovies) => currentMovies.filter((movie) => movie.id !== id));
    onMarkWatched(id);
  }

  return (
    <div>
      <h2>Watchlist</h2>
      <AddMovieForm onAdded={fetchMovies} />
      {loading && <p>Loading...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && movies.length === 0 && (
        <p>No movies in watchlist yet.</p>
      )}
      <ul>
        {movies.map((movie) => (
          <WatchlistItem
            key={movie.id}
            movie={movie}
            onMarkWatched={handleMarkWatched}
          />
        ))}
      </ul>
    </div>
  );
}
