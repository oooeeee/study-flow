import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WatchlistItem } from './WatchlistItem';
import type { Movie } from '../api/types';

const mockMovie: Movie = {
  id: '123',
  title: 'Inception',
  year: 2010,
  status: 'planned',
  rating: null,
  review: null,
  added_at: '2026-04-10T10:00:00Z',
  watched_at: null,
};

const movieWithoutYear: Movie = {
  ...mockMovie,
  year: null,
};

describe('WatchlistItem', () => {
  it('should render movie title', () => {
    render(<WatchlistItem movie={mockMovie} />);
    expect(screen.getByText('Inception')).toBeInTheDocument();
  });

  it('should render movie year when present', () => {
    render(<WatchlistItem movie={mockMovie} />);
    expect(screen.getByText('2010')).toBeInTheDocument();
  });

  it('should not render year when null', () => {
    render(<WatchlistItem movie={movieWithoutYear} />);
    expect(screen.queryByText(/^\d{4}$/)).not.toBeInTheDocument();
  });

  it('should render "Mark as Watched" button', () => {
    render(<WatchlistItem movie={mockMovie} />);
    expect(screen.getByRole('button', { name: /mark as watched/i })).toBeInTheDocument();
  });

  it('should call onMarkWatched when button is clicked', () => {
    const onMarkWatched = vi.fn();
    render(<WatchlistItem movie={mockMovie} onMarkWatched={onMarkWatched} />);

    const button = screen.getByRole('button', { name: /mark as watched/i });
    fireEvent.click(button);

    expect(onMarkWatched).toHaveBeenCalledWith(mockMovie);
  });

  it('should pass correct movie to onMarkWatched', () => {
    const onMarkWatched = vi.fn();
    const customMovie = { ...mockMovie, id: 'custom-id-456', title: 'The Matrix' };
    render(<WatchlistItem movie={customMovie} onMarkWatched={onMarkWatched} />);

    const button = screen.getByRole('button', { name: /mark as watched/i });
    fireEvent.click(button);

    expect(onMarkWatched).toHaveBeenCalledWith(customMovie);
  });

  it('should disable button when isLoading is true', () => {
    render(<WatchlistItem movie={mockMovie} isLoading={true} />);
    const button = screen.getByRole('button', { name: /mark as watched/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should enable button when isLoading is false', () => {
    render(<WatchlistItem movie={mockMovie} isLoading={false} />);
    const button = screen.getByRole('button', { name: /mark as watched/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });
});
