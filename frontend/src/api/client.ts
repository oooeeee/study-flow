import type {
  Movie,
  MovieStatus,
  AddMovieRequest,
  RateMovieRequest,
} from "./types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function addMovie(data: AddMovieRequest): Promise<Movie> {
  const res = await fetch(`${BASE_URL}/movies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`addMovie failed: ${res.status}`);
  return res.json();
}

export async function listMovies(status?: MovieStatus): Promise<Movie[]> {
  const url = status
    ? `${BASE_URL}/movies?status=${status}`
    : `${BASE_URL}/movies`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`listMovies failed: ${res.status}`);
  return res.json();
}

export async function markWatched(id: string): Promise<Movie> {
  const res = await fetch(`${BASE_URL}/movies/${id}/watch`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`markWatched failed: ${res.status}`);
  return res.json();
}

export async function rateMovie(
  id: string,
  data: RateMovieRequest,
): Promise<Movie> {
  const res = await fetch(`${BASE_URL}/movies/${id}/rate`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`rateMovie failed: ${res.status}`);
  return res.json();
}

export async function deleteMovie(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/movies/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`deleteMovie failed: ${res.status}`);
}
