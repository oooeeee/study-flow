import { useState } from 'react'
import { markWatched, rateMovie } from '../api/client'

interface RateMovieModalProps {
  movieId: string
  onSave: () => void
  onCancel: () => void
}

export function RateMovieModal({ movieId, onSave, onCancel }: RateMovieModalProps) {
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await markWatched(movieId)
      await rateMovie(movieId, { rating, review: review || undefined })
      onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div role="dialog" aria-label="Rate movie">
      <h3>Rate Movie</h3>
      <label htmlFor="rating">Rating (1–10)</label>
      <input
        id="rating"
        type="number"
        min={1}
        max={10}
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      />
      <label htmlFor="review">Review (optional)</label>
      <textarea
        id="review"
        value={review}
        onChange={(e) => setReview(e.target.value)}
      />
      <button onClick={handleSave} disabled={saving}>
        Save
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}
