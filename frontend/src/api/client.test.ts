import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as client from './client';
import type { Movie } from './types';

const mockMovie: Movie = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Inception',
  year: 2010,
  status: 'planned',
  rating: null,
  review: null,
  added_at: '2026-04-10T10:00:00Z',
  watched_at: null,
};

const mockWatchedMovie: Movie = {
  ...mockMovie,
  status: 'watched',
  rating: 9,
  review: 'Amazing movie',
  watched_at: '2026-04-11T10:00:00Z',
};

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addMovie', () => {
    it('should POST to /movies with correct payload', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockMovie,
      });

      const result = await client.addMovie({ title: 'Inception', year: 2010 });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/movies',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ title: 'Inception', year: 2010 }),
        })
      );
      expect(result).toEqual(mockMovie);
    });

    it('should handle missing year', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockMovie,
      });

      await client.addMovie({ title: 'Inception' });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/movies',
        expect.objectContaining({
          body: JSON.stringify({ title: 'Inception' }),
        })
      );
    });

    it('should throw on non-ok response', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(client.addMovie({ title: 'Inception' })).rejects.toThrow(
        'API error: 400 Bad Request'
      );
    });
  });

  describe('listMovies', () => {
    it('should GET from /movies without filter', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => [mockMovie],
      });

      const result = await client.listMovies();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/movies',
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual([mockMovie]);
    });

    it('should GET from /movies with status filter', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => [mockWatchedMovie],
      });

      const result = await client.listMovies('watched');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/movies?status=watched',
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual([mockWatchedMovie]);
    });

    it('should support planned status filter', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => [mockMovie],
      });

      await client.listMovies('planned');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/movies?status=planned',
        expect.anything()
      );
    });
  });

  describe('markWatched', () => {
    it('should PATCH to /movies/{id}/watch', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockWatchedMovie,
      });

      const result = await client.markWatched('123e4567-e89b-12d3-a456-426614174000');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/movies/123e4567-e89b-12d3-a456-426614174000/watch',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({}),
        })
      );
      expect(result).toEqual(mockWatchedMovie);
    });
  });

  describe('rateMovie', () => {
    it('should PATCH to /movies/{id}/rate with rating', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockWatchedMovie,
      });

      const result = await client.rateMovie('123e4567-e89b-12d3-a456-426614174000', {
        rating: 9,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/movies/123e4567-e89b-12d3-a456-426614174000/rate',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ rating: 9 }),
        })
      );
      expect(result).toEqual(mockWatchedMovie);
    });

    it('should include review when provided', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockWatchedMovie,
      });

      await client.rateMovie('123e4567-e89b-12d3-a456-426614174000', {
        rating: 9,
        review: 'Amazing movie',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: JSON.stringify({ rating: 9, review: 'Amazing movie' }),
        })
      );
    });
  });

  describe('deleteMovie', () => {
    it('should DELETE /movies/{id}', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await client.deleteMovie('123e4567-e89b-12d3-a456-426614174000');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/movies/123e4567-e89b-12d3-a456-426614174000',
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should handle 404 error', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(client.deleteMovie('invalid-id')).rejects.toThrow('API error: 404 Not Found');
    });
  });

  describe('environment configuration', () => {
    it('should use VITE_API_URL when set', async () => {
      import.meta.env.VITE_API_URL = 'http://api.example.com';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => [mockMovie],
      });

      await client.listMovies();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.example.com/movies',
        expect.anything()
      );

      // Reset
      import.meta.env.VITE_API_URL = '';
    });

    it('should default to http://localhost:8000', async () => {
      import.meta.env.VITE_API_URL = '';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => [mockMovie],
      });

      await client.listMovies();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/movies',
        expect.anything()
      );
    });
  });
});
