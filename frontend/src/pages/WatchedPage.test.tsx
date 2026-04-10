import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { WatchedPage } from "./WatchedPage";
import * as client from "../api/client";
import type { Movie } from "../api/types";

vi.mock("../api/client");

const movies: Movie[] = [
  {
    id: "1",
    title: "Inception",
    year: 2010,
    status: "watched",
    rating: 9,
    review: null,
    added_at: "2024-01-01T00:00:00",
    watched_at: "2024-02-01T00:00:00",
  },
  {
    id: "2",
    title: "Dune",
    year: 2021,
    status: "watched",
    rating: 8,
    review: "Epic",
    added_at: "2024-01-02T00:00:00",
    watched_at: "2024-03-01T00:00:00",
  },
];

describe("WatchedPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders list of watched movies with ratings", async () => {
    vi.mocked(client.listMovies).mockResolvedValue(movies);

    render(<WatchedPage />);

    await waitFor(() => {
      expect(screen.getByText(/Inception \(2010\)/)).toBeInTheDocument();
      expect(screen.getByText(/Dune \(2021\)/)).toBeInTheDocument();
      expect(screen.getByText(/9\/10/)).toBeInTheDocument();
      expect(screen.getByText(/8\/10/)).toBeInTheDocument();
    });
    expect(client.listMovies).toHaveBeenCalledWith("watched");
  });

  it("shows empty state when no watched movies", async () => {
    vi.mocked(client.listMovies).mockResolvedValue([]);

    render(<WatchedPage />);

    await waitFor(() => {
      expect(screen.getByText("No watched movies yet.")).toBeInTheDocument();
    });
  });

  it("shows error when fetch fails", async () => {
    vi.mocked(client.listMovies).mockRejectedValue(new Error("Network error"));

    render(<WatchedPage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Network error");
    });
  });

  it("sorts movies by watched_at descending", async () => {
    vi.mocked(client.listMovies).mockResolvedValue(movies);

    render(<WatchedPage />);

    await waitFor(() => {
      const items = screen.getAllByRole("listitem");
      expect(items[0]).toHaveTextContent("Dune");
      expect(items[1]).toHaveTextContent("Inception");
    });
  });
});
