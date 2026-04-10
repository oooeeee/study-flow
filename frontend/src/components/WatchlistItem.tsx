import { useState } from 'react'
import type { Movie } from '../api/types'
import { RateMovieModal } from './RateMovieModal'

interface WatchlistItemProps {
  movie: Movie
  onWatched: () => void
}

export function WatchlistItem({ movie, onWatched }: WatchlistItemProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <div>
      <span>
        {movie.title}
        {movie.year ? ` (${movie.year})` : ''}
      </span>
      <button onClick={() => setShowModal(true)}>Mark as watched</button>
      {showModal && (
        <RateMovieModal
          movieId={movie.id}
          onSave={() => {
            setShowModal(false)
            onWatched()
          }}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
