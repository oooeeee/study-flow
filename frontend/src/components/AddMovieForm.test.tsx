import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { AddMovieForm } from './AddMovieForm'

vi.mock('../api/client', () => ({
  addMovie: vi.fn(),
}))

import { addMovie } from '../api/client'

const mockAddMovie = addMovie as ReturnType<typeof vi.fn>

describe('AddMovieForm', () => {
  beforeEach(() => {
    mockAddMovie.mockReset()
  })

  it('renders title and year inputs and submit button', () => {
    render(<AddMovieForm onAdded={() => {}} />)
    expect(screen.getByLabelText('Movie title')).toBeInTheDocument()
    expect(screen.getByLabelText('Year')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Movie' })).toBeInTheDocument()
  })

  it('calls addMovie and clears form on successful submit', async () => {
    mockAddMovie.mockResolvedValue({ id: '1', title: 'Inception', year: 2010 })
    const onAdded = vi.fn()
    render(<AddMovieForm onAdded={onAdded} />)

    fireEvent.change(screen.getByLabelText('Movie title'), { target: { value: 'Inception' } })
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2010' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Add Movie' }).closest('form')!)

    await waitFor(() => {
      expect(mockAddMovie).toHaveBeenCalledWith({ title: 'Inception', year: 2010 })
      expect(onAdded).toHaveBeenCalled()
    })

    expect((screen.getByLabelText('Movie title') as HTMLInputElement).value).toBe('')
    expect((screen.getByLabelText('Year') as HTMLInputElement).value).toBe('')
  })

  it('shows error message when addMovie fails', async () => {
    mockAddMovie.mockRejectedValue(new Error('Network error'))
    render(<AddMovieForm onAdded={() => {}} />)

    fireEvent.change(screen.getByLabelText('Movie title'), { target: { value: 'Dune' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Add Movie' }).closest('form')!)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to add movie')
    })
  })

  it('submits without year when year is empty', async () => {
    mockAddMovie.mockResolvedValue({ id: '2', title: 'Dune', year: null })
    const onAdded = vi.fn()
    render(<AddMovieForm onAdded={onAdded} />)

    fireEvent.change(screen.getByLabelText('Movie title'), { target: { value: 'Dune' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Add Movie' }).closest('form')!)

    await waitFor(() => {
      expect(mockAddMovie).toHaveBeenCalledWith({ title: 'Dune', year: undefined })
    })
  })
})
