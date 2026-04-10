import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'
import * as client from './api/client'

vi.mock('./api/client');

describe('App', () => {
  beforeEach(() => {
    vi.mocked(client.listMovies).mockResolvedValue([]);
  });

  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText('Movie Planner')).toBeInTheDocument()
  })

  it('displays navigation buttons', () => {
    render(<App />)
    const buttons = screen.getAllByRole('button', { name: /Watchlist|Watched/ })
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('shows Watchlist page by default', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('Add a Movie')).toBeInTheDocument()
    })
  })

  it('switches to Watched page when clicking Watched button', async () => {
    render(<App />)
    const watchedButton = screen.getByRole('button', { name: /^Watched$/ })
    fireEvent.click(watchedButton)
    await waitFor(() => {
      expect(screen.getByText('Watched Movies')).toBeInTheDocument()
    })
  })

  it('switches back to Watchlist when clicking Watchlist button', async () => {
    render(<App />)
    const watchedButton = screen.getByRole('button', { name: /^Watched$/ })
    fireEvent.click(watchedButton)

    await waitFor(() => {
      expect(screen.getByText('Watched Movies')).toBeInTheDocument()
    })

    const watchlistButton = screen.getByRole('button', { name: /^Watchlist$/ })
    fireEvent.click(watchlistButton)

    await waitFor(() => {
      expect(screen.getByText('Add a Movie')).toBeInTheDocument()
    })
  })
})
