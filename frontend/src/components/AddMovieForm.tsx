import { useState } from 'react';
import { addMovie } from '../api/client';
import type { Movie } from '../api/types';

interface AddMovieFormProps {
  onMovieAdded?: (movie: Movie) => void;
  isLoading?: boolean;
}

export function AddMovieForm({ onMovieAdded, isLoading = false }: AddMovieFormProps) {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const yearNum = year ? parseInt(year, 10) : undefined;
      const movie = await addMovie({
        title: title.trim(),
        year: yearNum,
      });
      setTitle('');
      setYear('');
      onMovieAdded?.(movie);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add movie');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Movie Title *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Inception"
          disabled={isSubmitting || isLoading}
        />
      </div>

      <div>
        <label htmlFor="year">Year (optional)</label>
        <input
          id="year"
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="e.g., 2010"
          disabled={isSubmitting || isLoading}
        />
      </div>

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={isSubmitting || isLoading}>
        {isSubmitting ? 'Adding...' : 'Add Movie'}
      </button>
    </form>
  );
}
