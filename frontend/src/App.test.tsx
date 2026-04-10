import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import App from './App'

vi.mock('./api/client', () => ({
  listMovies: vi.fn().mockResolvedValue([]),
  addMovie: vi.fn(),
  markWatched: vi.fn(),
  rateMovie: vi.fn(),
  deleteMovie: vi.fn(),
}))

test('App renders without crashing', () => {
  render(<App />)
  expect(screen.getByText('Movie Planner')).toBeInTheDocument()
})

test('App renders Watchlist and Watched tabs', () => {
  render(<App />)
  expect(screen.getByRole('button', { name: 'Watchlist' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Watched' })).toBeInTheDocument()
})
