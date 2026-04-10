import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import App from "./App";
import * as client from "./api/client";

vi.mock("./api/client");

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(client.listMovies).mockResolvedValue([]);
  });

  it("renders without crashing", () => {
    render(<App />);
    expect(screen.getByText("Movie Planner")).toBeInTheDocument();
  });

  it("shows Watchlist tab by default", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: "Watchlist" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("switches to Watched tab on click", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Watched" }));
    expect(screen.getByRole("button", { name: "Watched" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
