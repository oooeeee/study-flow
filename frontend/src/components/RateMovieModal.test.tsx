import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { RateMovieModal } from "./RateMovieModal";
import * as client from "../api/client";

vi.mock("../api/client");

const baseMovie = {
  id: "1",
  title: "Inception",
  year: 2010,
  status: "watched" as const,
  rating: null,
  review: null,
  added_at: "2024-01-01T00:00:00",
  watched_at: "2024-02-01T00:00:00",
};

describe("RateMovieModal", () => {
  const onSave = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with movie title, rating selector, review textarea, Save and Cancel buttons", () => {
    render(
      <RateMovieModal
        movieId="1"
        movieTitle="Inception"
        onSave={onSave}
        onCancel={onCancel}
      />,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Inception/)).toBeInTheDocument();
    expect(screen.getByLabelText("Rating (1–10)")).toBeInTheDocument();
    expect(screen.getByLabelText("Review (optional)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("calls markWatched and rateMovie with selected rating on save, then calls onSave", async () => {
    vi.mocked(client.markWatched).mockResolvedValue(baseMovie);
    vi.mocked(client.rateMovie).mockResolvedValue({
      ...baseMovie,
      rating: 8,
    });

    render(
      <RateMovieModal
        movieId="1"
        movieTitle="Inception"
        onSave={onSave}
        onCancel={onCancel}
      />,
    );

    fireEvent.change(screen.getByLabelText("Rating (1–10)"), {
      target: { value: "8" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(client.markWatched).toHaveBeenCalledWith("1");
      expect(client.rateMovie).toHaveBeenCalledWith("1", { rating: 8 });
      expect(onSave).toHaveBeenCalledTimes(1);
    });
  });

  it("includes review in rateMovie call when review is provided", async () => {
    vi.mocked(client.markWatched).mockResolvedValue(baseMovie);
    vi.mocked(client.rateMovie).mockResolvedValue({
      ...baseMovie,
      rating: 7,
      review: "Great film",
    });

    render(
      <RateMovieModal
        movieId="1"
        movieTitle="Inception"
        onSave={onSave}
        onCancel={onCancel}
      />,
    );

    fireEvent.change(screen.getByLabelText("Rating (1–10)"), {
      target: { value: "7" },
    });
    fireEvent.change(screen.getByLabelText("Review (optional)"), {
      target: { value: "Great film" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(client.rateMovie).toHaveBeenCalledWith("1", {
        rating: 7,
        review: "Great film",
      });
    });
  });

  it("calls onCancel without making API calls when Cancel is clicked", () => {
    render(
      <RateMovieModal
        movieId="1"
        movieTitle="Inception"
        onSave={onSave}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(client.markWatched).not.toHaveBeenCalled();
    expect(client.rateMovie).not.toHaveBeenCalled();
  });

  it("shows error message when API call fails", async () => {
    vi.mocked(client.markWatched).mockRejectedValue(new Error("Network error"));

    render(
      <RateMovieModal
        movieId="1"
        movieTitle="Inception"
        onSave={onSave}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Network error");
    });
    expect(onSave).not.toHaveBeenCalled();
  });
});
