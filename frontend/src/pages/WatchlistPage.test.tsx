import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WatchlistPage } from './WatchlistPage';
import * as client from '../api/client';

vi.mock('../api/client', () => ({
  listMovies: vi.fn(),
  addMovie: vi.fn(),
  markWatched: vi.fn(),
  rateMovie: vi.fn(),
}));

const mockPlannedMovie = {
  id: '123',
  title: 'Inception',
  year: 2010,
  status: 'planned' as const,
  rating: null,
  review: null,
  added_at: '2026-04-10T10:00:00Z',
  watched_at: null,
};

const mockAnotherMovie = {
  id: '456',
  title: 'The Matrix',
  year: 1999,
  status: 'planned' as const,
  rating: null,
  review: null,
  added_at: '2026-04-10T11:00:00Z',
  watched_at: null,
};

describe('WatchlistPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render watchlist heading', async () => {
    vi.mocked(client.listMovies).mockResolvedValueOnce([]);
    render(<WatchlistPage />);
    expect(screen.getByText('Watchlist')).toBeInTheDocument();
  });

  it('should load and render planned movies on mount', async () => {
    vi.mocked(client.listMovies).mockResolvedValueOnce([mockPlannedMovie, mockAnotherMovie]);
    render(<WatchlistPage />);

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
      expect(screen.getByText('The Matrix')).toBeInTheDocument();
    });
  });

  it('should show loading message while fetching', () => {
    vi.mocked(client.listMovies).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    );
    render(<WatchlistPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display empty state when no movies', async () => {
    vi.mocked(client.listMovies).mockResolvedValueOnce([]);
    render(<WatchlistPage />);

    await waitFor(() => {
      expect(screen.getByText(/no planned movies yet/i)).toBeInTheDocument();
    });
  });

  it('should render AddMovieForm component', async () => {
    vi.mocked(client.listMovies).mockResolvedValueOnce([]);
    render(<WatchlistPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Movie Title *')).toBeInTheDocument();
    });
  });

  it('should render WatchlistItem for each movie', async () => {
    vi.mocked(client.listMovies).mockResolvedValueOnce([mockPlannedMovie, mockAnotherMovie]);
    render(<WatchlistPage />);

    await waitFor(() => {
      const buttons = screen.getAllByRole('button', { name: /mark as watched/i });
      expect(buttons).toHaveLength(2);
    });
  });

  it('should show error when loading movies fails', async () => {
    vi.mocked(client.listMovies).mockRejectedValueOnce(new Error('Network error'));
    render(<WatchlistPage />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should display count of planned movies', async () => {
    vi.mocked(client.listMovies).mockResolvedValueOnce([mockPlannedMovie, mockAnotherMovie]);
    render(<WatchlistPage />);

    await waitFor(() => {
      expect(screen.getByText('Planned Movies (2)')).toBeInTheDocument();
    });
  });

  it('should display count of 0 when no movies', async () => {
    vi.mocked(client.listMovies).mockResolvedValueOnce([]);
    render(<WatchlistPage />);

    await waitFor(() => {
      expect(screen.getByText('Planned Movies (0)')).toBeInTheDocument();
    });
  });

  it('should open modal and refetch movies after rating', async () => {
    const ratedMovie = { ...mockPlannedMovie, status: 'watched' as const, rating: 8, watched_at: '2026-04-10T12:00:00Z' };

    vi.mocked(client.listMovies)
      .mockResolvedValueOnce([mockPlannedMovie])
      .mockResolvedValueOnce([]); // After marking watched, no more planned movies
    vi.mocked(client.markWatched).mockResolvedValueOnce(ratedMovie);
    vi.mocked(client.rateMovie).mockResolvedValueOnce(ratedMovie);

    render(<WatchlistPage />);

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });

    const markButton = screen.getByRole('button', { name: /mark as watched/i });
    fireEvent.click(markButton);

    // Modal should open
    await waitFor(() => {
      expect(screen.getByText('Rate Movie')).toBeInTheDocument();
    });

    // Select rating
    const ratingBtn = screen.getByRole('button', { name: '8' });
    fireEvent.click(ratingBtn);

    // Save
    const saveBtn = screen.getByRole('button', { name: /save rating/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(client.markWatched).toHaveBeenCalledWith('123');
      expect(client.rateMovie).toHaveBeenCalledWith('123', { rating: 8, review: null });
      expect(client.listMovies).toHaveBeenCalledTimes(2);
    });
  });

  it('should add new movie to the list', async () => {
    vi.mocked(client.listMovies).mockResolvedValueOnce([]);
    vi.mocked(client.addMovie).mockResolvedValueOnce(mockPlannedMovie);

    render(<WatchlistPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Movie Title *')).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText('Movie Title *');
    const submitButton = screen.getByRole('button', { name: /add movie/i });

    fireEvent.change(titleInput, { target: { value: 'Inception' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });
  });

  it('should call listMovies with planned status filter', async () => {
    vi.mocked(client.listMovies).mockResolvedValueOnce([]);
    render(<WatchlistPage />);

    await waitFor(() => {
      expect(client.listMovies).toHaveBeenCalledWith('planned');
    });
  });

  it('should show Add a Movie section', async () => {
    vi.mocked(client.listMovies).mockResolvedValueOnce([]);
    render(<WatchlistPage />);

    await waitFor(() => {
      expect(screen.getByText('Add a Movie')).toBeInTheDocument();
    });
  });
});
