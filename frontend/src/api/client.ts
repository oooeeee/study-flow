import type { AddMovieRequest, Movie, MovieStatus, RateMovieRequest } from './types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return response.json() as Promise<T>
}

export function addMovie(data: AddMovieRequest): Promise<Movie> {
  return request<Movie>('/movies', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function listMovies(status?: MovieStatus): Promise<Movie[]> {
  const query = status ? `?status=${status}` : ''
  return request<Movie[]>(`/movies${query}`)
}

export function markWatched(id: string): Promise<Movie> {
  return request<Movie>(`/movies/${id}/watch`, { method: 'PATCH' })
}

export function rateMovie(id: string, data: RateMovieRequest): Promise<Movie> {
  return request<Movie>(`/movies/${id}/rate`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteMovie(id: string): Promise<void> {
  return request<void>(`/movies/${id}`, { method: 'DELETE' })
}
