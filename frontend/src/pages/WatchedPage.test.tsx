import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { WatchedPage } from './WatchedPage'

vi.mock('../api/client', () => ({
  listMovies: vi.fn(),
}))

import { listMovies } from '../api/client'

const mockListMovies = listMovies as ReturnType<typeof vi.fn>

const movies = [
  {
    id: '1',
    title: 'Inception',
    year: 2010,
    status: 'watched' as const,
    rating: 9,
    review: 'Great film',
    added_at: '2026-01-01T00:00:00',
    watched_at: '2026-01-10T00:00:00',
  },
  {
    id: '2',
    title: 'Dune',
    year: 2021,
    status: 'watched' as const,
    rating: 8,
    review: null,
    added_at: '2026-01-02T00:00:00',
    watched_at: '2026-01-15T00:00:00',
  },
]

describe('WatchedPage', () => {
  beforeEach(() => {
    mockListMovies.mockReset()
  })

  it('fetches and renders watched movies', async () => {
    mockListMovies.mockResolvedValue(movies)
    render(<WatchedPage />)

    await waitFor(() => {
      expect(screen.getByText(/Inception \(2010\)/)).toBeInTheDocument()
      expect(screen.getByText(/Dune \(2021\)/)).toBeInTheDocument()
    })
    expect(mockListMovies).toHaveBeenCalledWith('watched')
  })

  it('shows empty state when no watched movies', async () => {
    mockListMovies.mockResolvedValue([])
    render(<WatchedPage />)

    await waitFor(() => {
      expect(screen.getByText('No watched movies yet')).toBeInTheDocument()
    })
  })

  it('shows error when fetch fails', async () => {
    mockListMovies.mockRejectedValue(new Error('Network error'))
    render(<WatchedPage />)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load watched movies')
    })
  })

  it('renders movies with ratings', async () => {
    mockListMovies.mockResolvedValue(movies)
    render(<WatchedPage />)

    await waitFor(() => {
      expect(screen.getByText(/9\/10/)).toBeInTheDocument()
      expect(screen.getByText(/8\/10/)).toBeInTheDocument()
    })
  })

  it('sorts movies by watched_at descending', async () => {
    mockListMovies.mockResolvedValue(movies)
    render(<WatchedPage />)

    await waitFor(() => {
      const items = screen.getAllByRole('listitem')
      expect(items[0]).toHaveTextContent('Dune')
      expect(items[1]).toHaveTextContent('Inception')
    })
  })
})
