import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { WatchlistItem } from "./WatchlistItem";
import type { Movie } from "../api/types";
import * as client from "../api/client";

vi.mock("../api/client");

const baseMovie: Movie = {
  id: "1",
  title: "Inception",
  year: 2010,
  status: "planned",
  rating: null,
  review: null,
  added_at: "2024-01-01T00:00:00",
  watched_at: null,
};

const watchedMovie: Movie = {
  ...baseMovie,
  status: "watched",
  watched_at: "2024-02-01T00:00:00",
};

describe("WatchlistItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title and year", () => {
    render(<WatchlistItem movie={baseMovie} onMarkWatched={vi.fn()} />);
    expect(screen.getByText("Inception (2010)")).toBeInTheDocument();
  });

  it("renders title without year when year is null", () => {
    const movie = { ...baseMovie, year: null };
    render(<WatchlistItem movie={movie} onMarkWatched={vi.fn()} />);
    expect(screen.getByText("Inception")).toBeInTheDocument();
  });

  it("opens modal when Mark as watched button is clicked", () => {
    render(<WatchlistItem movie={baseMovie} onMarkWatched={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mark as watched" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("calls onMarkWatched after modal save and closes modal", async () => {
    vi.mocked(client.markWatched).mockResolvedValue(watchedMovie);
    vi.mocked(client.rateMovie).mockResolvedValue({
      ...watchedMovie,
      rating: 8,
    });

    const onMarkWatched = vi.fn();
    render(<WatchlistItem movie={baseMovie} onMarkWatched={onMarkWatched} />);

    fireEvent.click(screen.getByRole("button", { name: "Mark as watched" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(onMarkWatched).toHaveBeenCalledWith("1");
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes modal on cancel without calling onMarkWatched", () => {
    render(<WatchlistItem movie={baseMovie} onMarkWatched={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Mark as watched" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
