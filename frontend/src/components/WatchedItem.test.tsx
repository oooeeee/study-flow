import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WatchedItem } from './WatchedItem';
import type { Movie } from '../api/types';

describe('WatchedItem', () => {
  const mockMovie: Movie = {
    id: '1',
    title: 'Test Movie',
    year: 2023,
    status: 'watched',
    rating: 8,
    review: 'Great movie!',
    added_at: '2024-01-01T00:00:00Z',
    watched_at: '2024-01-02T00:00:00Z',
  };

  it('renders movie title and year', () => {
    render(<WatchedItem movie={mockMovie} />);
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
  });

  it('renders rating with stars', () => {
    render(<WatchedItem movie={mockMovie} />);
    expect(screen.getByText(/⭐.*8\/10/)).toBeInTheDocument();
  });

  it('renders review text', () => {
    render(<WatchedItem movie={mockMovie} />);
    expect(screen.getByText('Great movie!')).toBeInTheDocument();
  });

  it('handles movie without review', () => {
    const movieWithoutReview: Movie = {
      ...mockMovie,
      review: null,
    };
    render(<WatchedItem movie={movieWithoutReview} />);
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.queryByText('Great movie!')).not.toBeInTheDocument();
  });

  it('handles movie with null rating', () => {
    const movieWithoutRating: Movie = {
      ...mockMovie,
      rating: null,
    };
    render(<WatchedItem movie={movieWithoutRating} />);
    expect(screen.getByText('Not rated')).toBeInTheDocument();
  });

  it('handles movie without year', () => {
    const movieWithoutYear: Movie = {
      ...mockMovie,
      year: null,
    };
    render(<WatchedItem movie={movieWithoutYear} />);
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.queryByText('2023')).not.toBeInTheDocument();
  });
});
