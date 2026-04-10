import { useState } from "react";
import { addMovie } from "../api/client";

interface AddMovieFormProps {
  onAdded: () => void;
}

export function AddMovieForm({ onAdded }: AddMovieFormProps) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await addMovie({
        title: title.trim(),
        year: year ? Number(year) : undefined,
      });
      setTitle("");
      setYear("");
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add movie");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Add movie form">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        aria-label="Title"
      />
      <input
        type="number"
        placeholder="Year (optional)"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        min={1888}
        max={2100}
        aria-label="Year"
      />
      <button type="submit" disabled={submitting || !title.trim()}>
        Add Movie
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
