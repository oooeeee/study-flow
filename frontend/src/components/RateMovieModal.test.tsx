import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RateMovieModal } from './RateMovieModal';
import type { Movie } from '../api/types';
import * as client from '../api/client';

vi.mock('../api/client');

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

const ratedMovie: Movie = {
  ...mockMovie,
  status: 'watched',
  rating: 8,
  review: 'Amazing film!',
  watched_at: '2026-04-10T11:00:00Z',
};

describe('RateMovieModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    render(
      <RateMovieModal movie={mockMovie} isOpen={false} onClose={onClose} onSave={onSave} />
    );

    expect(screen.queryByText('Rate Movie')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    render(
      <RateMovieModal movie={mockMovie} isOpen={true} onClose={onClose} onSave={onSave} />
    );

    expect(screen.getByText('Rate Movie')).toBeInTheDocument();
    expect(screen.getByText('Inception')).toBeInTheDocument();
  });

  it('should render rating buttons 1-10', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    render(
      <RateMovieModal movie={mockMovie} isOpen={true} onClose={onClose} onSave={onSave} />
    );

    for (let i = 1; i <= 10; i++) {
      expect(screen.getByRole('button', { name: `${i}` })).toBeInTheDocument();
    }
  });

  it('should allow rating selection', async () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    render(
      <RateMovieModal movie={mockMovie} isOpen={true} onClose={onClose} onSave={onSave} />
    );

    const ratingBtn = screen.getByRole('button', { name: '8' });
    fireEvent.click(ratingBtn);

    await waitFor(() => {
      expect(screen.getByText('Selected: 8/10')).toBeInTheDocument();
    });
  });

  it('should render review textarea', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    render(
      <RateMovieModal movie={mockMovie} isOpen={true} onClose={onClose} onSave={onSave} />
    );

    const textarea = screen.getByRole('textbox', { name: /review/i }) as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe('');
  });

  it('should allow review input', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    render(
      <RateMovieModal movie={mockMovie} isOpen={true} onClose={onClose} onSave={onSave} />
    );

    const textarea = screen.getByRole('textbox', { name: /review/i }) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Amazing film!' } });

    expect(textarea.value).toBe('Amazing film!');
  });

  it('should show error when trying to save without rating', async () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    render(
      <RateMovieModal movie={mockMovie} isOpen={true} onClose={onClose} onSave={onSave} />
    );

    const saveBtn = screen.getByRole('button', { name: /save rating/i });
    fireEvent.click(saveBtn);

    // Use findByText which automatically waits for element to appear
    const errorElement = await screen.findByText('Please select a rating');
    expect(errorElement).toBeInTheDocument();
  });

  it('should call markWatched and rateMovie on save', async () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    const mockMarkWatched = vi.fn().mockResolvedValue(ratedMovie);
    const mockRateMovie = vi.fn().mockResolvedValue(ratedMovie);

    vi.mocked(client.markWatched).mockImplementation(mockMarkWatched);
    vi.mocked(client.rateMovie).mockImplementation(mockRateMovie);

    render(
      <RateMovieModal movie={mockMovie} isOpen={true} onClose={onClose} onSave={onSave} />
    );

    // Select rating
    const ratingBtn = screen.getByRole('button', { name: '8' });
    fireEvent.click(ratingBtn);

    // Add review
    const textarea = screen.getByRole('textbox', { name: /review/i });
    fireEvent.change(textarea, { target: { value: 'Amazing film!' } });

    // Save
    const saveBtn = screen.getByRole('button', { name: /save rating/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockMarkWatched).toHaveBeenCalledWith('123');
      expect(mockRateMovie).toHaveBeenCalledWith('123', {
        rating: 8,
        review: 'Amazing film!',
      });
      expect(onSave).toHaveBeenCalledWith(ratedMovie);
    });
  });

  it('should pass null review if empty', async () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    const mockMarkWatched = vi.fn().mockResolvedValue(ratedMovie);
    const mockRateMovie = vi.fn().mockResolvedValue(ratedMovie);

    vi.mocked(client.markWatched).mockImplementation(mockMarkWatched);
    vi.mocked(client.rateMovie).mockImplementation(mockRateMovie);

    render(
      <RateMovieModal movie={mockMovie} isOpen={true} onClose={onClose} onSave={onSave} />
    );

    // Select rating
    const ratingBtn = screen.getByRole('button', { name: '5' });
    fireEvent.click(ratingBtn);

    // Save without review
    const saveBtn = screen.getByRole('button', { name: /save rating/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockRateMovie).toHaveBeenCalledWith('123', {
        rating: 5,
        review: null,
      });
    });
  });

  it('should call onClose when cancel button is clicked', async () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    render(
      <RateMovieModal movie={mockMovie} isOpen={true} onClose={onClose} onSave={onSave} />
    );

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    render(
      <RateMovieModal movie={mockMovie} isOpen={true} onClose={onClose} onSave={onSave} />
    );

    const closeBtn = screen.getByRole('button', { name: '✕' });
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it('should close overlay when clicking outside modal', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    const { container } = render(
      <RateMovieModal movie={mockMovie} isOpen={true} onClose={onClose} onSave={onSave} />
    );

    const overlay = container.querySelector('.modal-overlay');
    if (overlay) {
      fireEvent.click(overlay);
    }

    expect(onClose).toHaveBeenCalled();
  });

  it('should not close when clicking modal content', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    const { container } = render(
      <RateMovieModal movie={mockMovie} isOpen={true} onClose={onClose} onSave={onSave} />
    );

    const modalContent = container.querySelector('.modal-content');
    if (modalContent) {
      fireEvent.click(modalContent);
    }

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should show error on API failure', async () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    const mockError = new Error('API error');
    const mockMarkWatched = vi.fn().mockRejectedValue(mockError);

    vi.mocked(client.markWatched).mockImplementation(mockMarkWatched);

    render(
      <RateMovieModal movie={mockMovie} isOpen={true} onClose={onClose} onSave={onSave} />
    );

    // Select rating
    const ratingBtn = screen.getByRole('button', { name: '7' });
    fireEvent.click(ratingBtn);

    // Save
    const saveBtn = screen.getByRole('button', { name: /save rating/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('API error')).toBeInTheDocument();
    });
  });

  it('should disable buttons while saving', async () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    const mockMarkWatched = vi.fn().mockImplementation(() => new Promise(() => {})); // Never resolves

    vi.mocked(client.markWatched).mockImplementation(mockMarkWatched);

    render(
      <RateMovieModal movie={mockMovie} isOpen={true} onClose={onClose} onSave={onSave} />
    );

    // Select rating
    const ratingBtn = screen.getByRole('button', { name: '6' });
    fireEvent.click(ratingBtn);

    // Save
    const saveBtn = screen.getByRole('button', { name: /save rating/i }) as HTMLButtonElement;
    fireEvent.click(saveBtn);

    // Check button is disabled
    expect(saveBtn.disabled).toBe(true);
  });

  it('should display year when present', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    render(
      <RateMovieModal movie={mockMovie} isOpen={true} onClose={onClose} onSave={onSave} />
    );

    expect(screen.getByText('2010')).toBeInTheDocument();
  });

  it('should handle movie without year', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    const movieNoYear = { ...mockMovie, year: null };
    render(
      <RateMovieModal movie={movieNoYear} isOpen={true} onClose={onClose} onSave={onSave} />
    );

    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.queryByText(/^\d{4}$/)).not.toBeInTheDocument();
  });
});
