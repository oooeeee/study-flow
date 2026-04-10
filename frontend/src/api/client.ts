import type { Movie, AddMovieRequest, RateRequest } from './types';

const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiCall = async (
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<unknown> => {
  const url = `${getApiUrl()}${path}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const addMovie = async (request: AddMovieRequest): Promise<Movie> => {
  return (await apiCall('POST', '/movies', request)) as Movie;
};

export const listMovies = async (status?: 'planned' | 'watched'): Promise<Movie[]> => {
  const path = status ? `/movies?status=${status}` : '/movies';
  return (await apiCall('GET', path)) as Movie[];
};

export const markWatched = async (id: string): Promise<Movie> => {
  return (await apiCall('PATCH', `/movies/${id}/watch`, {})) as Movie;
};

export const rateMovie = async (id: string, request: RateRequest): Promise<Movie> => {
  return (await apiCall('PATCH', `/movies/${id}/rate`, request)) as Movie;
};

export const deleteMovie = async (id: string): Promise<void> => {
  await apiCall('DELETE', `/movies/${id}`);
};
