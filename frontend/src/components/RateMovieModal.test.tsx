import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { RateMovieModal } from './RateMovieModal'

vi.mock('../api/client', () => ({
  markWatched: vi.fn(),
  rateMovie: vi.fn(),
}))

import { markWatched, rateMovie } from '../api/client'

const mockMarkWatched = markWatched as ReturnType<typeof vi.fn>
const mockRateMovie = rateMovie as ReturnType<typeof vi.fn>

describe('RateMovieModal', () => {
  beforeEach(() => {
    mockMarkWatched.mockReset()
    mockRateMovie.mockReset()
  })

  it('renders rating picker, review textarea, and Save/Cancel buttons', () => {
    render(<RateMovieModal movieId="1" onSave={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('dialog', { name: 'Rate movie' })).toBeInTheDocument()
    expect(screen.getByLabelText('Rating (1–10)')).toBeInTheDocument()
    expect(screen.getByLabelText('Review (optional)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('calls markWatched and rateMovie with rating on save', async () => {
    const watchedMovie = { id: '1', status: 'watched' }
    mockMarkWatched.mockResolvedValue(watchedMovie)
    mockRateMovie.mockResolvedValue({ ...watchedMovie, rating: 8 })
    const onSave = vi.fn()

    render(<RateMovieModal movieId="1" onSave={onSave} onCancel={() => {}} />)

    fireEvent.change(screen.getByLabelText('Rating (1–10)'), { target: { value: '8' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(mockMarkWatched).toHaveBeenCalledWith('1')
      expect(mockRateMovie).toHaveBeenCalledWith('1', { rating: 8, review: undefined })
      expect(onSave).toHaveBeenCalled()
    })
  })

  it('includes review text when provided', async () => {
    const watchedMovie = { id: '1', status: 'watched' }
    mockMarkWatched.mockResolvedValue(watchedMovie)
    mockRateMovie.mockResolvedValue({ ...watchedMovie, rating: 7, review: 'Great film' })
    const onSave = vi.fn()

    render(<RateMovieModal movieId="1" onSave={onSave} onCancel={() => {}} />)

    fireEvent.change(screen.getByLabelText('Rating (1–10)'), { target: { value: '7' } })
    fireEvent.change(screen.getByLabelText('Review (optional)'), {
      target: { value: 'Great film' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(mockRateMovie).toHaveBeenCalledWith('1', { rating: 7, review: 'Great film' })
      expect(onSave).toHaveBeenCalled()
    })
  })

  it('calls onCancel without making API calls when Cancel clicked', () => {
    const onCancel = vi.fn()
    render(<RateMovieModal movieId="1" onSave={() => {}} onCancel={onCancel} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalled()
    expect(mockMarkWatched).not.toHaveBeenCalled()
    expect(mockRateMovie).not.toHaveBeenCalled()
  })
})
