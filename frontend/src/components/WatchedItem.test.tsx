import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { WatchedItem } from "./WatchedItem";
import type { Movie } from "../api/types";

const watchedMovie: Movie = {
  id: "1",
  title: "Inception",
  year: 2010,
  status: "watched",
  rating: 9,
  review: "Mind-blowing film",
  added_at: "2024-01-01T00:00:00",
  watched_at: "2024-02-01T00:00:00",
};

describe("WatchedItem", () => {
  it("renders title and year", () => {
    render(<WatchedItem movie={watchedMovie} />);
    expect(screen.getByText(/Inception \(2010\)/)).toBeInTheDocument();
  });

  it("renders title without year when year is null", () => {
    const movie = { ...watchedMovie, year: null };
    render(<WatchedItem movie={movie} />);
    expect(screen.getByText(/^Inception/)).toBeInTheDocument();
    expect(screen.queryByText(/\(2010\)/)).not.toBeInTheDocument();
  });

  it("renders rating when present", () => {
    render(<WatchedItem movie={watchedMovie} />);
    expect(screen.getByText(/9\/10/)).toBeInTheDocument();
  });

  it("does not render rating when null", () => {
    const movie = { ...watchedMovie, rating: null };
    render(<WatchedItem movie={movie} />);
    expect(screen.queryByText(/\/10/)).not.toBeInTheDocument();
  });

  it("renders review text when present", () => {
    render(<WatchedItem movie={watchedMovie} />);
    expect(screen.getByText("Mind-blowing film")).toBeInTheDocument();
  });

  it("does not render review when null", () => {
    const movie = { ...watchedMovie, review: null };
    render(<WatchedItem movie={movie} />);
    expect(screen.queryByText("Mind-blowing film")).not.toBeInTheDocument();
  });
});
