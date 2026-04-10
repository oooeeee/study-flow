import { useState } from 'react';
import type { Movie } from '../api/types';
import { markWatched, rateMovie } from '../api/client';

interface RateMovieModalProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
  onSave: (movie: Movie) => void;
  isLoading?: boolean;
}

export function RateMovieModal({
  movie,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: RateMovieModalProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (rating === null) {
      setError('Please select a rating');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      // First mark as watched
      await markWatched(movie.id);
      // Then rate the movie
      const updatedMovie = await rateMovie(movie.id, {
        rating,
        review: review || null,
      });
      onSave(updatedMovie);
      // Reset form
      setRating(null);
      setReview('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rating');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setRating(null);
    setReview('');
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Rate Movie</h2>
          <button className="close-btn" onClick={handleCancel} disabled={isSaving}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="movie-title-section">
            <h3>{movie.title}</h3>
            {movie.year && <p className="year">{movie.year}</p>}
          </div>

          <div className="rating-section">
            <label htmlFor="rating">Rating (1-10)</label>
            <div className="rating-picker">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  className={`rating-btn ${rating === num ? 'active' : ''}`}
                  onClick={() => setRating(num)}
                  disabled={isSaving}
                  title={`Rate ${num}`}
                >
                  {num}
                </button>
              ))}
            </div>
            {rating !== null && <p className="rating-display">Selected: {rating}/10</p>}
          </div>

          <div className="review-section">
            <label htmlFor="review">Review (optional)</label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write your thoughts about this movie..."
              disabled={isSaving}
              maxLength={500}
            />
            <p className="char-count">{review.length}/500</p>
          </div>

          {error && <div className="error">{error}</div>}
        </div>

        <div className="modal-footer">
          <button
            className="btn-cancel"
            onClick={handleCancel}
            disabled={isSaving || isLoading}
          >
            Cancel
          </button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={isSaving || isLoading}
          >
            {isSaving ? 'Saving...' : 'Save Rating'}
          </button>
        </div>
      </div>
    </div>
  );
}
