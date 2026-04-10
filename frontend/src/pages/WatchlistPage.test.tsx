import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { WatchlistPage } from './WatchlistPage'

vi.mock('../api/client', () => ({
  listMovies: vi.fn(),
  addMovie: vi.fn(),
}))

import { listMovies, addMovie } from '../api/client'

const mockListMovies = listMovies as ReturnType<typeof vi.fn>
const mockAddMovie = addMovie as ReturnType<typeof vi.fn>

const movies = [
  {
    id: '1',
    title: 'Inception',
    year: 2010,
    status: 'planned' as const,
    rating: null,
    review: null,
    added_at: '2026-01-01T00:00:00',
    watched_at: null,
  },
  {
    id: '2',
    title: 'Dune',
    year: 2021,
    status: 'planned' as const,
    rating: null,
    review: null,
    added_at: '2026-01-02T00:00:00',
    watched_at: null,
  },
]

describe('WatchlistPage', () => {
  beforeEach(() => {
    mockListMovies.mockReset()
    mockAddMovie.mockReset()
  })

  it('fetches and renders planned movies', async () => {
    mockListMovies.mockResolvedValue(movies)
    render(<WatchlistPage onMarkWatched={() => {}} />)

    await waitFor(() => {
      expect(screen.getByText('Inception (2010)')).toBeInTheDocument()
      expect(screen.getByText('Dune (2021)')).toBeInTheDocument()
    })
    expect(mockListMovies).toHaveBeenCalledWith('planned')
  })

  it('shows empty state when no movies', async () => {
    mockListMovies.mockResolvedValue([])
    render(<WatchlistPage onMarkWatched={() => {}} />)

    await waitFor(() => {
      expect(screen.getByText('No movies in watchlist')).toBeInTheDocument()
    })
  })

  it('shows error when fetch fails', async () => {
    mockListMovies.mockRejectedValue(new Error('Network error'))
    render(<WatchlistPage onMarkWatched={() => {}} />)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load watchlist')
    })
  })

  it('calls onMarkWatched with movie id when Mark as watched clicked', async () => {
    mockListMovies.mockResolvedValue(movies)
    const onMarkWatched = vi.fn()
    render(<WatchlistPage onMarkWatched={onMarkWatched} />)

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Mark as watched' })).toHaveLength(2)
    })

    fireEvent.click(screen.getAllByRole('button', { name: 'Mark as watched' })[0])
    expect(onMarkWatched).toHaveBeenCalledWith('1')
  })

  it('refetches list after adding a movie', async () => {
    mockListMovies.mockResolvedValue(movies)
    mockAddMovie.mockResolvedValue({ id: '3', title: 'Matrix', year: 1999, status: 'planned' })
    render(<WatchlistPage onMarkWatched={() => {}} />)

    await waitFor(() => {
      expect(screen.getByText('Inception (2010)')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Movie title'), { target: { value: 'Matrix' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Add Movie' }).closest('form')!)

    await waitFor(() => {
      expect(mockListMovies).toHaveBeenCalledTimes(2)
    })
  })
})
