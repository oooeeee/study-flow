import { useState } from 'react'
import { WatchlistPage } from './pages/WatchlistPage'
import { WatchedPage } from './pages/WatchedPage'

type Tab = 'watchlist' | 'watched'

function App() {
  const [tab, setTab] = useState<Tab>('watchlist')

  return (
    <div>
      <h1>Movie Planner</h1>
      <nav>
        <button
          onClick={() => setTab('watchlist')}
          aria-current={tab === 'watchlist' ? 'page' : undefined}
        >
          Watchlist
        </button>
        <button
          onClick={() => setTab('watched')}
          aria-current={tab === 'watched' ? 'page' : undefined}
        >
          Watched
        </button>
      </nav>
      {tab === 'watchlist' ? <WatchlistPage /> : <WatchedPage />}
    </div>
  )
}

export default App
