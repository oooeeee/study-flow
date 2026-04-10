import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { WatchlistItem } from './WatchlistItem'
import type { Movie } from '../api/types'

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
  it('renders movie title and year', () => {
    render(<WatchlistItem movie={baseMovie} onMarkWatched={() => {}} />)
    expect(screen.getByText('Inception (2010)')).toBeInTheDocument()
  })

  it('renders without year when year is null', () => {
    render(<WatchlistItem movie={{ ...baseMovie, year: null }} onMarkWatched={() => {}} />)
    expect(screen.getByText('Inception')).toBeInTheDocument()
  })

  it('calls onMarkWatched with movie id when button clicked', () => {
    const onMarkWatched = vi.fn()
    render(<WatchlistItem movie={baseMovie} onMarkWatched={onMarkWatched} />)
    fireEvent.click(screen.getByRole('button', { name: 'Mark as watched' }))
    expect(onMarkWatched).toHaveBeenCalledWith('1')
  })
})
