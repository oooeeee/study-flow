import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { WatchlistPage } from "./WatchlistPage";
import * as client from "../api/client";
import type { Movie } from "../api/types";

vi.mock("../api/client");

const movies: Movie[] = [
  {
    id: "1",
    title: "Inception",
    year: 2010,
    status: "planned",
    rating: null,
    review: null,
    added_at: "2024-01-01T00:00:00",
    watched_at: null,
  },
  {
    id: "2",
    title: "Dune",
    year: 2021,
    status: "planned",
    rating: null,
    review: null,
    added_at: "2024-01-02T00:00:00",
    watched_at: null,
  },
];

describe("WatchlistPage", () => {
  const onMarkWatched = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders list of planned movies", async () => {
    vi.mocked(client.listMovies).mockResolvedValue(movies);

    render(<WatchlistPage onMarkWatched={onMarkWatched} />);

    await waitFor(() => {
      expect(screen.getByText("Inception (2010)")).toBeInTheDocument();
      expect(screen.getByText("Dune (2021)")).toBeInTheDocument();
    });
    expect(client.listMovies).toHaveBeenCalledWith("planned");
  });

  it("shows empty state when no movies", async () => {
    vi.mocked(client.listMovies).mockResolvedValue([]);

    render(<WatchlistPage onMarkWatched={onMarkWatched} />);

    await waitFor(() => {
      expect(
        screen.getByText("No movies in watchlist yet."),
      ).toBeInTheDocument();
    });
  });

  it("shows error when fetch fails", async () => {
    vi.mocked(client.listMovies).mockRejectedValue(new Error("Network error"));

    render(<WatchlistPage onMarkWatched={onMarkWatched} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Network error");
    });
  });

  it("opens rate modal when Mark as watched button is clicked", async () => {
    vi.mocked(client.listMovies).mockResolvedValue(movies);

    render(<WatchlistPage onMarkWatched={onMarkWatched} />);

    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: "Mark as watched" }),
      ).toHaveLength(2);
    });

    fireEvent.click(
      screen.getAllByRole("button", { name: "Mark as watched" })[0],
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("refetches movies after adding a new one", async () => {
    vi.mocked(client.listMovies).mockResolvedValue(movies);
    vi.mocked(client.addMovie).mockResolvedValue({
      id: "3",
      title: "The Matrix",
      year: 1999,
      status: "planned",
      rating: null,
      review: null,
      added_at: "2024-01-03T00:00:00",
      watched_at: null,
    });

    render(<WatchlistPage onMarkWatched={onMarkWatched} />);

    await waitFor(() => {
      expect(screen.getByText("Inception (2010)")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "The Matrix" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Movie" }));

    await waitFor(() => {
      expect(client.listMovies).toHaveBeenCalledTimes(2);
    });
  });

  it("removes a movie from the watchlist immediately after marking it watched", async () => {
    vi.mocked(client.listMovies).mockResolvedValue(movies);
    vi.mocked(client.markWatched).mockResolvedValue({
      ...movies[0],
      status: "watched",
      watched_at: "2024-02-01T00:00:00",
    });
    vi.mocked(client.rateMovie).mockResolvedValue({
      ...movies[0],
      status: "watched",
      rating: 5,
      watched_at: "2024-02-01T00:00:00",
    });

    render(<WatchlistPage onMarkWatched={onMarkWatched} />);

    await waitFor(() => {
      expect(screen.getByText("Inception (2010)")).toBeInTheDocument();
      expect(screen.getByText("Dune (2021)")).toBeInTheDocument();
    });

    onMarkWatched.mockClear();
    fireEvent.click(screen.getAllByRole("button", { name: "Mark as watched" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.queryByText("Inception (2010)")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Dune (2021)")).toBeInTheDocument();
    expect(onMarkWatched).toHaveBeenCalledWith("1");
  });
});
