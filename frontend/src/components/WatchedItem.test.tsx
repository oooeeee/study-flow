import { render, screen } from '@testing-library/react'
import { WatchedItem } from './WatchedItem'
import type { Movie } from '../api/types'

const baseMovie: Movie = {
  id: '1',
  title: 'Inception',
  year: 2010,
  status: 'watched',
  rating: 9,
  review: 'Mind-bending film',
  added_at: '2026-01-01T00:00:00',
  watched_at: '2026-01-10T00:00:00',
}

describe('WatchedItem', () => {
  it('renders title and year', () => {
    render(<WatchedItem movie={baseMovie} />)
    expect(screen.getByText(/Inception \(2010\)/)).toBeInTheDocument()
  })

  it('renders rating', () => {
    render(<WatchedItem movie={baseMovie} />)
    expect(screen.getByText(/9\/10/)).toBeInTheDocument()
  })

  it('renders review text', () => {
    render(<WatchedItem movie={baseMovie} />)
    expect(screen.getByText('Mind-bending film')).toBeInTheDocument()
  })

  it('renders without year when year is null', () => {
    render(<WatchedItem movie={{ ...baseMovie, year: null }} />)
    expect(screen.getByText('Inception')).toBeInTheDocument()
    expect(screen.queryByText(/\(/)).not.toBeInTheDocument()
  })

  it('renders without review when review is null', () => {
    render(<WatchedItem movie={{ ...baseMovie, review: null }} />)
    expect(screen.queryByText('Mind-bending film')).not.toBeInTheDocument()
  })

  it('renders without rating when rating is null', () => {
    render(<WatchedItem movie={{ ...baseMovie, rating: null }} />)
    expect(screen.queryByText(/\/10/)).not.toBeInTheDocument()
  })
})
