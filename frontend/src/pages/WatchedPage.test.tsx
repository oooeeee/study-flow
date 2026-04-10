import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { WatchedPage } from './WatchedPage';
import * as client from '../api/client';
import type { Movie } from '../api/types';

vi.mock('../api/client');

describe('WatchedPage', () => {
  const mockMovies: Movie[] = [
    {
      id: '1',
      title: 'First Movie',
      year: 2020,
      status: 'watched',
      rating: 7,
      review: 'Good',
      added_at: '2024-01-01T00:00:00Z',
      watched_at: '2024-01-02T00:00:00Z',
    },
    {
      id: '2',
      title: 'Second Movie',
      year: 2021,
      status: 'watched',
      rating: 9,
      review: 'Excellent',
      added_at: '2024-01-01T00:00:00Z',
      watched_at: '2024-01-03T00:00:00Z',
    },
    {
      id: '3',
      title: 'Third Movie',
      year: 2022,
      status: 'watched',
      rating: 8,
      review: null,
      added_at: '2024-01-01T00:00:00Z',
      watched_at: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', async () => {
    vi.mocked(client.listMovies).mockResolvedValue([]);
    render(<WatchedPage />);
    expect(screen.getByText('Watched Movies')).toBeInTheDocument();
  });

  it('fetches and displays watched movies', async () => {
    vi.mocked(client.listMovies).mockResolvedValue(mockMovies);
    render(<WatchedPage />);

    await waitFor(() => {
      expect(screen.getByText('First Movie')).toBeInTheDocument();
      expect(screen.getByText('Second Movie')).toBeInTheDocument();
      expect(screen.getByText('Third Movie')).toBeInTheDocument();
    });
  });

  it('calls listMovies with watched status', async () => {
    vi.mocked(client.listMovies).mockResolvedValue([]);
    render(<WatchedPage />);

    await waitFor(() => {
      expect(client.listMovies).toHaveBeenCalledWith('watched');
    });
  });

  it('sorts movies by watched_at descending (most recent first)', async () => {
    vi.mocked(client.listMovies).mockResolvedValue(mockMovies);
    render(<WatchedPage />);

    await waitFor(() => {
      expect(screen.getByText('Second Movie')).toBeInTheDocument();
    });

    // Get the container with movie items
    const movieItems = document.querySelectorAll('.watched-item h3');
    // Should be sorted: Second (2024-01-03), First (2024-01-02), Third (2024-01-01)
    expect(movieItems[0]).toHaveTextContent('Second Movie');
    expect(movieItems[1]).toHaveTextContent('First Movie');
    expect(movieItems[2]).toHaveTextContent('Third Movie');
  });

  it('displays empty state when no movies', async () => {
    vi.mocked(client.listMovies).mockResolvedValue([]);
    render(<WatchedPage />);

    await waitFor(() => {
      expect(screen.getByText('No watched movies yet. Mark one from your watchlist!')).toBeInTheDocument();
    });
  });

  it('displays error when API fails', async () => {
    vi.mocked(client.listMovies).mockRejectedValue(new Error('Network error'));
    render(<WatchedPage />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('displays movie count', async () => {
    vi.mocked(client.listMovies).mockResolvedValue(mockMovies);
    render(<WatchedPage />);

    await waitFor(() => {
      expect(screen.getByText('Watched (3)')).toBeInTheDocument();
    });
  });
});
