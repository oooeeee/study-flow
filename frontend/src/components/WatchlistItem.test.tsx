import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { WatchlistItem } from './WatchlistItem'
import type { Movie } from '../api/types'

vi.mock('../api/client', () => ({
  markWatched: vi.fn(),
  rateMovie: vi.fn(),
}))

import { markWatched, rateMovie } from '../api/client'

const mockMarkWatched = markWatched as ReturnType<typeof vi.fn>
const mockRateMovie = rateMovie as ReturnType<typeof vi.fn>

const baseMovie: Movie = {
  id: '1',
  title: 'Inception',
  year: 2010,
  status: 'planned',
  rating: null,
  review: null,
  added_at: '2026-01-01T00:00:00',
  watched_at: null,
}

describe('WatchlistItem', () => {
  beforeEach(() => {
    mockMarkWatched.mockReset()
    mockRateMovie.mockReset()
  })

  it('renders movie title and year', () => {
    render(<WatchlistItem movie={baseMovie} onWatched={() => {}} />)
    expect(screen.getByText('Inception (2010)')).toBeInTheDocument()
  })

  it('renders without year when year is null', () => {
    render(<WatchlistItem movie={{ ...baseMovie, year: null }} onWatched={() => {}} />)
    expect(screen.getByText('Inception')).toBeInTheDocument()
  })

  it('shows modal when Mark as watched button clicked', () => {
    render(<WatchlistItem movie={baseMovie} onWatched={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Mark as watched' }))
    expect(screen.getByRole('dialog', { name: 'Rate movie' })).toBeInTheDocument()
  })

  it('closes modal without API call when Cancel clicked', () => {
    render(<WatchlistItem movie={baseMovie} onWatched={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Mark as watched' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(mockMarkWatched).not.toHaveBeenCalled()
  })

  it('calls onWatched and closes modal after successful save', async () => {
    const movie = { id: '1', title: 'Test', status: 'watched' as const }
    mockMarkWatched.mockResolvedValue(movie)
    mockRateMovie.mockResolvedValue(movie)
    const onWatched = vi.fn()
    render(<WatchlistItem movie={baseMovie} onWatched={onWatched} />)
    fireEvent.click(screen.getByRole('button', { name: 'Mark as watched' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(onWatched).toHaveBeenCalled()
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
