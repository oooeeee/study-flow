import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  addMovie,
  listMovies,
  markWatched,
  rateMovie,
  deleteMovie,
} from "./client";
import type { Movie } from "./types";

const mockMovie: Movie = {
  id: "abc-123",
  title: "Inception",
  year: 2010,
  status: "planned",
  rating: null,
  review: null,
  added_at: "2024-01-01T00:00:00Z",
  watched_at: null,
};

function mockFetch(body: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("addMovie", () => {
  it("sends POST /movies with title and year", async () => {
    globalThis.fetch = mockFetch(mockMovie);
    const result = await addMovie({ title: "Inception", year: 2010 });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/movies",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ title: "Inception", year: 2010 }),
      }),
    );
    expect(result).toEqual(mockMovie);
  });

  it("throws on non-ok response", async () => {
    globalThis.fetch = mockFetch({}, 500);
    await expect(addMovie({ title: "X" })).rejects.toThrow(
      "addMovie failed: 500",
    );
  });
});

describe("listMovies", () => {
  it("sends GET /movies without filter", async () => {
    globalThis.fetch = mockFetch([mockMovie]);
    const result = await listMovies();
    expect(fetch).toHaveBeenCalledWith("http://localhost:8000/movies");
    expect(result).toEqual([mockMovie]);
  });

  it("sends GET /movies?status=planned when filter provided", async () => {
    globalThis.fetch = mockFetch([mockMovie]);
    await listMovies("planned");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/movies?status=planned",
    );
  });

  it("throws on non-ok response", async () => {
    globalThis.fetch = mockFetch({}, 500);
    await expect(listMovies()).rejects.toThrow("listMovies failed: 500");
  });
});

describe("markWatched", () => {
  it("sends PATCH /movies/:id/watch", async () => {
    const watched = { ...mockMovie, status: "watched" as const };
    globalThis.fetch = mockFetch(watched);
    const result = await markWatched("abc-123");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/movies/abc-123/watch",
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(result.status).toBe("watched");
  });

  it("throws on non-ok response", async () => {
    globalThis.fetch = mockFetch({}, 404);
    await expect(markWatched("bad-id")).rejects.toThrow(
      "markWatched failed: 404",
    );
  });
});

describe("rateMovie", () => {
  it("sends PATCH /movies/:id/rate with rating and review", async () => {
    const rated = { ...mockMovie, rating: 8, review: "great" };
    globalThis.fetch = mockFetch(rated);
    const result = await rateMovie("abc-123", { rating: 8, review: "great" });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/movies/abc-123/rate",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ rating: 8, review: "great" }),
      }),
    );
    expect(result.rating).toBe(8);
  });

  it("throws on non-ok response", async () => {
    globalThis.fetch = mockFetch({}, 422);
    await expect(rateMovie("abc-123", { rating: 11 })).rejects.toThrow(
      "rateMovie failed: 422",
    );
  });
});

describe("deleteMovie", () => {
  it("sends DELETE /movies/:id", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    await deleteMovie("abc-123");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/movies/abc-123",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("throws on non-ok response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    await expect(deleteMovie("bad-id")).rejects.toThrow(
      "deleteMovie failed: 404",
    );
  });
});
