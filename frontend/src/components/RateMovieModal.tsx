import { useState } from "react";
import { markWatched, rateMovie } from "../api/client";

interface RateMovieModalProps {
  movieId: string;
  movieTitle: string;
  onSave: () => void;
  onCancel: () => void;
}

export function RateMovieModal({
  movieId,
  movieTitle,
  onSave,
  onCancel,
}: RateMovieModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await markWatched(movieId);
      await rateMovie(movieId, { rating, review: review || undefined });
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Rate movie">
      <h3>Rate &ldquo;{movieTitle}&rdquo;</h3>
      <label htmlFor="rating">Rating (1–10)</label>
      <select
        id="rating"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      >
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <label htmlFor="review">Review (optional)</label>
      <textarea
        id="review"
        value={review}
        onChange={(e) => setReview(e.target.value)}
      />
      {error && <p role="alert">{error}</p>}
      <button onClick={handleSave} disabled={saving}>
        Save
      </button>
      <button onClick={onCancel} disabled={saving}>
        Cancel
      </button>
    </div>
  );
}
