import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { AddMovieForm } from "./AddMovieForm";
import * as client from "../api/client";

vi.mock("../api/client");

describe("AddMovieForm", () => {
  const onAdded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title and year inputs and submit button", () => {
    render(<AddMovieForm onAdded={onAdded} />);
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Year")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Movie" })).toBeInTheDocument();
  });

  it("calls addMovie with title on submit and clears form", async () => {
    vi.mocked(client.addMovie).mockResolvedValue({
      id: "1",
      title: "Inception",
      year: null,
      status: "planned",
      rating: null,
      review: null,
      added_at: "2024-01-01T00:00:00",
      watched_at: null,
    });

    render(<AddMovieForm onAdded={onAdded} />);
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Inception" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Movie" }));

    await waitFor(() => {
      expect(client.addMovie).toHaveBeenCalledWith({ title: "Inception" });
      expect(onAdded).toHaveBeenCalledTimes(1);
    });
    expect((screen.getByLabelText("Title") as HTMLInputElement).value).toBe("");
  });

  it("includes year in request when provided", async () => {
    vi.mocked(client.addMovie).mockResolvedValue({
      id: "2",
      title: "Dune",
      year: 2021,
      status: "planned",
      rating: null,
      review: null,
      added_at: "2024-01-01T00:00:00",
      watched_at: null,
    });

    render(<AddMovieForm onAdded={onAdded} />);
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Dune" },
    });
    fireEvent.change(screen.getByLabelText("Year"), {
      target: { value: "2021" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Movie" }));

    await waitFor(() => {
      expect(client.addMovie).toHaveBeenCalledWith({ title: "Dune", year: 2021 });
    });
  });

  it("shows error message when API call fails", async () => {
    vi.mocked(client.addMovie).mockRejectedValue(new Error("Server error"));

    render(<AddMovieForm onAdded={onAdded} />);
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Bad Movie" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add Movie" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Server error");
    });
    expect(onAdded).not.toHaveBeenCalled();
  });
});
