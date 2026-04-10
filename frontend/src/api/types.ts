export type MovieStatus = 'planned' | 'watched'

export interface Movie {
  id: string
  title: string
  year: number | null
  status: MovieStatus
  rating: number | null
  review: string | null
  added_at: string
  watched_at: string | null
}

export interface AddMovieRequest {
  title: string
  year?: number
}

export interface RateMovieRequest {
  rating: number
  review?: string
}
