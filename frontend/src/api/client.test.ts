import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addMovie, deleteMovie, listMovies, markWatched, rateMovie } from './client'
import type { Movie } from './types'

const mockMovie: Movie = {
  id: 'abc-123',
  title: 'Inception',
  year: 2010,
  status: 'planned',
  rating: null,
  review: null,
  added_at: '2024-01-01T00:00:00Z',
  watched_at: null,
}

function mockFetch(body: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  })
}

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch(mockMovie))
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('addMovie', () => {
  it('POSTs to /movies with the correct body', async () => {
    global.fetch = mockFetch(mockMovie)
    const result = await addMovie({ title: 'Inception', year: 2010 })

    expect(fetch).toHaveBeenCalledOnce()
    const [url, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/movies')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body as string)).toEqual({ title: 'Inception', year: 2010 })
    expect(result).toEqual(mockMovie)
  })
})

describe('listMovies', () => {
  it('GETs /movies without query param when no status given', async () => {
    global.fetch = mockFetch([mockMovie])
    await listMovies()

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string]
    expect(url).toMatch(/\/movies$/)
  })

  it('GETs /movies?status=planned when status is planned', async () => {
    global.fetch = mockFetch([mockMovie])
    await listMovies('planned')

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string]
    expect(url).toContain('?status=planned')
  })

  it('GETs /movies?status=watched when status is watched', async () => {
    global.fetch = mockFetch([mockMovie])
    await listMovies('watched')

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string]
    expect(url).toContain('?status=watched')
  })
})

describe('markWatched', () => {
  it('PATCHes /movies/{id}/watch', async () => {
    global.fetch = mockFetch(mockMovie)
    await markWatched('abc-123')

    const [url, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/movies/abc-123/watch')
    expect(options.method).toBe('PATCH')
  })
})

describe('rateMovie', () => {
  it('PATCHes /movies/{id}/rate with rating and review', async () => {
    global.fetch = mockFetch(mockMovie)
    await rateMovie('abc-123', { rating: 8, review: 'Great film' })

    const [url, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/movies/abc-123/rate')
    expect(options.method).toBe('PATCH')
    expect(JSON.parse(options.body as string)).toEqual({ rating: 8, review: 'Great film' })
  })

  it('PATCHes /movies/{id}/rate without review when omitted', async () => {
    global.fetch = mockFetch(mockMovie)
    await rateMovie('abc-123', { rating: 5 })

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
    expect(JSON.parse(options.body as string)).toEqual({ rating: 5 })
  })
})

describe('deleteMovie', () => {
  it('DELETEs /movies/{id}', async () => {
    global.fetch = mockFetch(null)
    await deleteMovie('abc-123')

    const [url, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/movies/abc-123')
    expect(options.method).toBe('DELETE')
  })
})

describe('error handling', () => {
  it('throws when response is not ok', async () => {
    global.fetch = mockFetch({ detail: 'Not found' }, 404)
    await expect(listMovies()).rejects.toThrow('HTTP 404')
  })
})
