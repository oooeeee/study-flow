import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddMovieForm } from './AddMovieForm';
import * as client from '../api/client';

vi.mock('../api/client', () => ({
  addMovie: vi.fn(),
}));

const mockMovie = {
  id: '123',
  title: 'Inception',
  year: 2010,
  status: 'planned' as const,
  rating: null,
  review: null,
  added_at: '2026-04-10T10:00:00Z',
  watched_at: null,
};

describe('AddMovieForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form with title and year inputs', () => {
    render(<AddMovieForm />);
    expect(screen.getByLabelText('Movie Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Year (optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add movie/i })).toBeInTheDocument();
  });

  it('should update title input on change', () => {
    render(<AddMovieForm />);
    const titleInput = screen.getByLabelText('Movie Title *') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Test Movie' } });
    expect(titleInput.value).toBe('Test Movie');
  });

  it('should update year input on change', () => {
    render(<AddMovieForm />);
    const yearInput = screen.getByLabelText('Year (optional)') as HTMLInputElement;
    fireEvent.change(yearInput, { target: { value: '2010' } });
    expect(yearInput.value).toBe('2010');
  });

  it('should show error when submitting with empty title', async () => {
    render(<AddMovieForm />);
    const submitButton = screen.getByRole('button', { name: /add movie/i });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });

  it('should call addMovie with title and year on submit', async () => {
    vi.mocked(client.addMovie).mockResolvedValueOnce(mockMovie);
    render(<AddMovieForm />);

    const titleInput = screen.getByLabelText('Movie Title *');
    const yearInput = screen.getByLabelText('Year (optional)');
    fireEvent.change(titleInput, { target: { value: 'Inception' } });
    fireEvent.change(yearInput, { target: { value: '2010' } });

    const submitButton = screen.getByRole('button', { name: /add movie/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(client.addMovie).toHaveBeenCalledWith({
        title: 'Inception',
        year: 2010,
      });
    });
  });

  it('should call addMovie with title only when year is empty', async () => {
    vi.mocked(client.addMovie).mockResolvedValueOnce(mockMovie);
    render(<AddMovieForm />);

    const titleInput = screen.getByLabelText('Movie Title *');
    fireEvent.change(titleInput, { target: { value: 'Inception' } });

    const submitButton = screen.getByRole('button', { name: /add movie/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(client.addMovie).toHaveBeenCalledWith({
        title: 'Inception',
      });
    });
  });

  it('should clear form after successful submission', async () => {
    vi.mocked(client.addMovie).mockResolvedValueOnce(mockMovie);
    render(<AddMovieForm />);

    const titleInput = screen.getByLabelText('Movie Title *') as HTMLInputElement;
    const yearInput = screen.getByLabelText('Year (optional)') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Inception' } });
    fireEvent.change(yearInput, { target: { value: '2010' } });

    const submitButton = screen.getByRole('button', { name: /add movie/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(titleInput.value).toBe('');
      expect(yearInput.value).toBe('');
    });
  });

  it('should call onMovieAdded callback on successful submission', async () => {
    const onMovieAdded = vi.fn();
    vi.mocked(client.addMovie).mockResolvedValueOnce(mockMovie);
    render(<AddMovieForm onMovieAdded={onMovieAdded} />);

    const titleInput = screen.getByLabelText('Movie Title *');
    fireEvent.change(titleInput, { target: { value: 'Inception' } });

    const submitButton = screen.getByRole('button', { name: /add movie/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onMovieAdded).toHaveBeenCalledWith(mockMovie);
    });
  });

  it('should show error message on API failure', async () => {
    vi.mocked(client.addMovie).mockRejectedValueOnce(new Error('Network error'));
    render(<AddMovieForm />);

    const titleInput = screen.getByLabelText('Movie Title *');
    fireEvent.change(titleInput, { target: { value: 'Inception' } });

    const submitButton = screen.getByRole('button', { name: /add movie/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should trim whitespace from title', async () => {
    vi.mocked(client.addMovie).mockResolvedValueOnce(mockMovie);
    render(<AddMovieForm />);

    const titleInput = screen.getByLabelText('Movie Title *');
    fireEvent.change(titleInput, { target: { value: '  Inception  ' } });

    const submitButton = screen.getByRole('button', { name: /add movie/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(client.addMovie).toHaveBeenCalledWith({
        title: 'Inception',
      });
    });
  });

  it('should disable form while submitting', async () => {
    vi.mocked(client.addMovie).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve(mockMovie), 100))
    );
    render(<AddMovieForm />);

    const titleInput = screen.getByLabelText('Movie Title *') as HTMLInputElement;
    const yearInput = screen.getByLabelText('Year (optional)') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /add movie/i }) as HTMLButtonElement;

    fireEvent.change(titleInput, { target: { value: 'Inception' } });
    fireEvent.click(submitButton);

    expect(titleInput.disabled).toBe(true);
    expect(yearInput.disabled).toBe(true);
    expect(submitButton.disabled).toBe(true);
  });

  it('should disable form when isLoading prop is true', () => {
    render(<AddMovieForm isLoading={true} />);

    const titleInput = screen.getByLabelText('Movie Title *') as HTMLInputElement;
    const yearInput = screen.getByLabelText('Year (optional)') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /add movie/i }) as HTMLButtonElement;

    expect(titleInput.disabled).toBe(true);
    expect(yearInput.disabled).toBe(true);
    expect(submitButton.disabled).toBe(true);
  });
});
