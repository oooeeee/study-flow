import { useState } from 'react'
import { addMovie } from '../api/client'

interface AddMovieFormProps {
  onAdded: () => void
}

export function AddMovieForm({ onAdded }: AddMovieFormProps) {
  const [title, setTitle] = useState('')
  const [year, setYear] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await addMovie({ title: title.trim(), year: year ? parseInt(year) : undefined })
      setTitle('')
      setYear('')
      onAdded()
    } catch {
      setError('Failed to add movie')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Movie title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Movie title"
        required
      />
      <input
        type="number"
        placeholder="Year (optional)"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        aria-label="Year"
        min={1888}
        max={2100}
      />
      <button type="submit" disabled={submitting}>
        Add Movie
      </button>
      {error && <span role="alert">{error}</span>}
    </form>
  )
}
