import { useEffect, useState } from "react";
import type { Movie } from "../api/types";
import { listMovies } from "../api/client";
import { WatchedItem } from "../components/WatchedItem";

interface WatchedPageProps {
  refreshKey?: number;
}

export function WatchedPage({ refreshKey }: WatchedPageProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchMovies() {
    setLoading(true);
    setError(null);
    try {
      const data = await listMovies("watched");
      const sorted = [...data].sort((a, b) => {
        if (!a.watched_at) return 1;
        if (!b.watched_at) return -1;
        return b.watched_at.localeCompare(a.watched_at);
      });
      setMovies(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load movies");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMovies();
  }, [refreshKey]);

  return (
    <div>
      <h2>Watched</h2>
      {loading && <p>Loading...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && movies.length === 0 && (
        <p>No watched movies yet.</p>
      )}
      <ul>
        {movies.map((movie) => (
          <WatchedItem key={movie.id} movie={movie} />
        ))}
      </ul>
    </div>
  );
}
